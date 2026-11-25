import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { scrollToId, useReducedMotion } from '../hooks';
import { navigate } from '../lib/router';
import { requestEnquiry } from '../lib/enquiryBus';
import { openIdea, openPlanner } from '../lib/guideEvents';
import { createBot, WELCOME_CHIPS, type Action, type BotReply } from './bot';
import { TOUR } from './tour';

type Mode = 'hidden' | 'greet' | 'tour' | 'chat' | 'dock';
interface Msg {
  id: number;
  from: 'bot' | 'user';
  text?: string;
  reply?: BotReply;
}

const VOICE_KEY = 'yantra-guide-voice';
const store = {
  get(k: string) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* private mode: nothing to remember */
    }
  },
};
const narrow = () => window.matchMedia('(max-width: 767px)').matches;
const IMG = import.meta.env.BASE_URL;

/** Reveals text a few characters at a time, like he is saying it. */
function useTyped(text: string, enabled: boolean) {
  const [n, setN] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    if (!enabled) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
  }, [text, enabled]);
  return { shown: text.slice(0, n), done: n >= text.length, finish: () => setN(text.length) };
}

/** Optional read-aloud (off by default; the visitor turns it on). */
function speak(text: string, on: boolean) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  if (!on || !text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-IN';
  u.rate = 1.02;
  window.speechSynthesis.speak(u);
}

/** Accent ring that follows the element being explained. */
function Ring({ selector }: { selector?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selector) return;
    let raf = 0;
    const tick = () => {
      const el = document.querySelector(selector);
      const ring = ref.current;
      if (el && ring) {
        const r = el.getBoundingClientRect();
        const pad = 10;
        const top = Math.max(r.top - pad, 8);
        const bottom = Math.min(r.bottom + pad, window.innerHeight - 8);
        const visible = bottom - top > 40 && r.right > 0 && r.left < window.innerWidth;
        ring.style.opacity = visible ? '1' : '0';
        ring.style.transform = `translate(${Math.max(r.left - pad, 6)}px, ${top}px)`;
        ring.style.width = `${Math.min(r.width + pad * 2, window.innerWidth - 12)}px`;
        ring.style.height = `${Math.max(0, bottom - top)}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selector]);
  if (!selector) return null;
  return <div ref={ref} className="guide-ring" aria-hidden="true" />;
}

function Figure({ mode, talking, morph, onClick }: { mode: Mode; talking: boolean; morph: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      className={`guide-figure${talking ? ' is-talking' : ''}${morph ? ' is-morphing' : ''}`}
      onClick={onClick}
      tabIndex={mode === 'chat' ? -1 : 0}
      aria-label="Yantra guide"
    >
      <span className="guide-figure__sway">
        <picture>
          <source srcSet={`${IMG}guide.webp`} type="image/webp" />
          <img src={`${IMG}guide.png`} alt="" width={171} height={640} draggable={false} />
        </picture>
      </span>
    </button>
  );
}

function ReplyView({ reply, onAction, onIdea, onChip, last }: { reply: BotReply; onAction(a: Action): void; onIdea(id: string): void; onChip(c: string): void; last: boolean }) {
  return (
    <>
      {reply.text.map((t, i) => (
        <p key={i}>{t}</p>
      ))}
      {reply.bullets && (
        <ul className="gchat__bullets">
          {reply.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {reply.detail && (
        <div className="gchat__detail">
          <strong>{reply.detail.title}</strong>
          {reply.detail.badge && <span className="gchat__badge">{reply.detail.badge}</span>}
          <dl>
            {reply.detail.rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {reply.ideas && (
        <ul className="gchat__ideas">
          {reply.ideas.map((i) => (
            <li key={i.id}>
              <button type="button" onClick={() => onIdea(i.id)}>
                <span className="gchat__idea-meta">
                  {i.tag} · {i.level}
                  {i.built && <em> · Built by Yantra</em>}
                </span>
                <span className="gchat__idea-title">{i.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {reply.actions && (
        <div className="gchat__actions">
          {reply.actions.map((a, i) => (
            <button key={a.label} type="button" className={`gchat__action${i === 0 ? ' is-primary' : ''}`} onClick={() => onAction(a)}>
              {a.label}
            </button>
          ))}
        </div>
      )}
      {last && reply.chips && (
        <div className="gchat__chips">
          {reply.chips.map((c) => (
            <button key={c} type="button" onClick={() => onChip(c)}>
              {c}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default function Guide() {
  const reduced = useReducedMotion();
  const bot = useMemo(() => createBot(), []);
  // The site has no server to recognise returning visitors (e.g. by IP), so every visit gets the greeting and tour offer.
  const [mode, setMode] = useState<Mode>('hidden');
  const [step, setStep] = useState(0);
  const [morph, setMorph] = useState(false);
  const [voice, setVoice] = useState(() => store.get(VOICE_KEY) === '1');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(false);
  const idRef = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const touched = useRef(false);

  // walk in shortly after the page has settled
  useEffect(() => {
    const t = window.setTimeout(() => setMode('greet'), 900);
    return () => clearTimeout(t);
  }, []);
  const greetText =
    'Hi, I’m your Yantra guide! 👋 I can walk you through the whole website in about a minute — what each section does and how to start your project.';
  const current = TOUR[step];
  const bubbleText = mode === 'greet' ? greetText : mode === 'tour' ? current.text : '';
  const typed = useTyped(bubbleText, !reduced && (mode === 'greet' || mode === 'tour'));

  useEffect(() => {
    if (mode === 'tour' || (mode === 'greet' && touched.current)) speak(bubbleText, voice);
  }, [bubbleText, mode, voice]);
  useEffect(() => () => speak('', false), []);

  /* ------------------------------- tour ------------------------------- */
  useEffect(() => {
    if (mode !== 'tour') return;
    // bring the highlighted part into view (falls back to the section)
    const el = current.target && current.section !== 'home' ? document.querySelector(current.target) : null;
    if (el) {
      const header = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 80;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header - 44, behavior: reduced ? 'auto' : 'smooth' });
    }
    else if (current.section) scrollToId(current.section);
    nextRef.current?.focus({ preventScroll: true });
  }, [mode, step, current.section, current.target, reduced]);

  const pushBot = useCallback((reply: BotReply) => setMsgs((m) => [...m, { id: ++idRef.current, from: 'bot', reply }]), []);

  const openChat = useCallback(
    (intro?: BotReply) => {
      touched.current = true;
      setUnread(false);
      setMode('chat');
      setMsgs((m) =>
        m.length
          ? m
          : [
              {
                id: ++idRef.current,
                from: 'bot',
                reply: intro ?? {
                  text: ['Hi! I can answer questions about Yantra’s services, suggest project ideas for your branch, explain what documentation or a PPT includes, and connect you with the team.'],
                  chips: WELCOME_CHIPS,
                },
              },
            ],
      );
    },
    [],
  );

  const endTour = useCallback(
    (finished: boolean) => {
      speak('', false);
      const intro: BotReply = {
        text: [
          finished
            ? 'That was the whole website, end to end. Now I’m your assistant — ask me anything about projects, ideas or contacting the team.'
            : 'No problem! I’m here whenever you need me — ask me anything about projects, ideas or contacting the team.',
        ],
        chips: WELCOME_CHIPS,
      };
      if (reduced) {
        openChat(intro);
        return;
      }
      setMorph(true);
      window.setTimeout(() => {
        setMorph(false);
        if (msgs.length) pushBot(intro);
        openChat(intro);
      }, 900);
    },
    [reduced, openChat, pushBot, msgs.length],
  );

  const startTour = () => {
    touched.current = true;
    setStep(0);
    setMode('tour');
  };
  const next = () => (step < TOUR.length - 1 ? setStep(step + 1) : endTour(true));
  const back = () => setStep((s) => Math.max(0, s - 1));

  useEffect(() => {
    if (mode !== 'tour') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endTour(false);
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /* ------------------------------- chat ------------------------------- */
  const respond = useCallback(
    async (get: () => Promise<BotReply>) => {
      setTyping(true);
      const started = Date.now();
      const reply = await get();
      const wait = reduced ? 0 : Math.max(0, 420 + Math.min(600, reply.text.join(' ').length * 4) - (Date.now() - started));
      window.setTimeout(() => {
        setTyping(false);
        pushBot(reply);
        if (voice) speak(reply.text.join(' '), true);
      }, wait);
    },
    [reduced, pushBot, voice],
  );

  const send = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setInput('');
    setMsgs((m) => [...m, { id: ++idRef.current, from: 'user', text: q }]);
    respond(() => bot.reply(q));
  };
  const showIdea = (id: string) => respond(() => bot.describe(id));

  // after taking the visitor somewhere on the page, step aside so it isn't covered (the chat is kept)
  const collapseIfNarrow = () => setMode('dock');
  const onAction = (a: Action) => {
    switch (a.kind) {
      case 'scroll':
        scrollToId(a.id);
        collapseIfNarrow();
        break;
      case 'link':
        if (a.external) window.open(a.href, '_blank', 'noopener');
        else {
          navigate(a.href);
          collapseIfNarrow();
        }
        break;
      case 'enquire':
        requestEnquiry(a.preset);
        collapseIfNarrow();
        break;
      case 'idea':
        openIdea(a.id);
        collapseIfNarrow();
        break;
      case 'planner':
        openPlanner({ programme: a.programme, branch: a.branch, type: a.type });
        collapseIfNarrow();
        break;
      case 'tour':
        startTour();
        break;
    }
  };

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
    if (mode === 'dock' && msgs.length && msgs[msgs.length - 1].from === 'bot') setUnread(true);
  }, [msgs, typing, reduced, mode]);
  useEffect(() => {
    if (mode === 'chat' && !narrow()) inputRef.current?.focus({ preventScroll: true });
    if (mode === 'chat') setUnread(false);
  }, [mode]);
  useEffect(() => {
    if (mode !== 'chat') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMode('dock');
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode]);

  const toggleVoice = () => {
    const v = !voice;
    setVoice(v);
    store.set(VOICE_KEY, v ? '1' : '0');
    if (!v) speak('', false);
  };
  const VoiceBtn = (
    <button type="button" className={`guide-icon${voice ? ' is-on' : ''}`} onClick={toggleVoice} aria-pressed={voice} aria-label={voice ? 'Turn voice off' : 'Read aloud'}>
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3 8v4h3l4 3V5L6 8H3z" />
        {voice ? <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" /> : <path d="m13 8 4 4m0-4-4 4" />}
      </svg>
    </button>
  );

  if (mode === 'hidden') return null;

  /* ------------------------------ render ------------------------------ */
  if (mode === 'dock')
    return (
      <div className="guide guide--dock" role="complementary" aria-label="Website guide">
        <button type="button" className="guide-launcher" onClick={() => openChat()} aria-label="Ask the Yantra guide">
          <img src={`${IMG}guide-head.webp`} alt="" width={56} height={56} />
          {unread && <span className="guide-launcher__dot" aria-hidden="true" />}
          <span className="guide-launcher__label">Ask me</span>
        </button>
      </div>
    );

  return (
    <div className={`guide guide--${mode}`} role="complementary" aria-label="Website guide">
      {mode === 'tour' && <Ring selector={current.target} />}

      {(mode === 'greet' || mode === 'tour') && (
        <section className={`guide-bubble${morph ? ' is-leaving' : ''}`} role="dialog" aria-labelledby={titleId} key={mode === 'tour' ? step : 'greet'}>
          <header className="guide-bubble__head">
            <span id={titleId} className="guide-bubble__title">
              {mode === 'tour' ? (
                <>
                  <span className="guide-bubble__step">
                    {step + 1}/{TOUR.length}
                  </span>
                  {current.title}
                </>
              ) : (
                'Yantra guide'
              )}
            </span>
            {VoiceBtn}
            <button
              type="button"
              className="guide-icon"
              aria-label={mode === 'tour' ? 'Skip the tour' : 'Close'}
              onClick={() => {
                if (mode === 'tour') return endTour(false);
                touched.current = true;
                setMode('dock');
              }}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="m5 5 10 10M15 5 5 15" />
              </svg>
            </button>
          </header>
          <p className="guide-bubble__text" onClick={typed.finish}>
            <span aria-hidden="true">
              {typed.shown}
              {!typed.done && <span className="guide-caret" />}
            </span>
            <span className="sr-only">{bubbleText}</span>
          </p>
          {mode === 'tour' && (
            <div className="guide-bubble__dots" aria-hidden="true">
              {TOUR.map((_, i) => (
                <span key={i} className={i === step ? 'is-on' : i < step ? 'is-done' : ''} />
              ))}
            </div>
          )}
          <div className="guide-bubble__actions">
            {mode === 'greet' ? (
              <>
                <button type="button" className="gbtn gbtn--lime" onClick={startTour}>
                  Show me around
                </button>
                <button type="button" className="gbtn" onClick={() => openChat()}>
                  Ask a question
                </button>
              </>
            ) : (
              <>
                <button type="button" className="gbtn gbtn--ghost" onClick={() => endTour(false)}>
                  Skip tour
                </button>
                <span className="guide-bubble__spacer" />
                <button type="button" className="gbtn" onClick={back} disabled={step === 0}>
                  Back
                </button>
                <button ref={nextRef} type="button" className="gbtn gbtn--lime" onClick={next}>
                  {step === TOUR.length - 1 ? 'Start chatting' : 'Next'}
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {mode === 'chat' && (
        <section className="gchat" role="dialog" aria-label="Chat with the Yantra guide">
          <header className="gchat__head">
            <img src={`${IMG}guide-head.webp`} alt="" width={40} height={40} className="gchat__avatar" />
            <div className="gchat__who">
              <strong>Yantra guide</strong>
              <span>
                <i className="gchat__online" aria-hidden="true" /> Answers from this website
              </span>
            </div>
            <button type="button" className="guide-icon" onClick={startTour} aria-label="Replay the website tour" title="Replay the tour">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 10a6 6 0 1 0 2-4.5M4 4v3h3" />
              </svg>
            </button>
            {VoiceBtn}
            <button type="button" className="guide-icon" onClick={() => setMode('dock')} aria-label="Minimise chat">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 10h10" />
              </svg>
            </button>
          </header>
          <div ref={logRef} className="gchat__log" role="log" aria-live="polite">
            {msgs.map((m, i) =>
              m.from === 'user' ? (
                <div key={m.id} className="gmsg gmsg--user">
                  {m.text}
                </div>
              ) : (
                <div key={m.id} className="gmsg gmsg--bot">
                  <ReplyView reply={m.reply!} onAction={onAction} onIdea={showIdea} onChip={send} last={i === msgs.length - 1 && !typing} />
                </div>
              ),
            )}
            {typing && (
              <div className="gmsg gmsg--bot gmsg--typing" aria-label="Guide is typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>
          <form
            className="gchat__form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <label htmlFor="guide-input" className="sr-only">
              Ask the guide
            </label>
            <input
              id="guide-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about projects, ideas, contact…"
              autoComplete="off"
              enterKeyHint="send"
              maxLength={300}
            />
            <button type="submit" className="gchat__send" aria-label="Send" disabled={!input.trim() || typing}>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 10h11m-4-4 4 4-4 4" />
              </svg>
            </button>
          </form>
        </section>
      )}

      <Figure mode={mode} talking={(!typed.done && (mode === 'greet' || mode === 'tour')) || typing} morph={morph} onClick={mode === 'chat' ? undefined : () => typed.finish()} />
    </div>
  );
}
