import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { certificates, navItems, profile } from '../../content/profile';
import { openCertificate } from '../../lib/certificates';
import { projects } from '../../content/projects';
import { confetti } from '../../lib/confetti';
import { canTiltWithDevice, enableDeviceTilt } from '../../lib/deviceTilt';
import { paletteShortcut } from '../../lib/palette';
import { ping } from '../../lib/ping';
import { downloadResume, openResume } from '../../lib/resume';
import { toggleTheme } from '../../lib/theme';
import { Icon } from './Icon';

const displayUrl = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
const smooth = () => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

// Scroll to a section and move keyboard focus there, closing a case study or the résumé first if one is open.
function goTo(id) {
  document.querySelector('.project-dialog[open]')?.close();
  document.querySelector('.resume-dialog[open]')?.close();
  setTimeout(() => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: smooth() });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }, 60);
}

// Every command: `run` either acts (the palette closes first) or, for terminal
// commands, returns lines to print in the palette.
function buildCommands() {
  const live = (project) => project.links.find((link) => link.primary);
  return [
    ...navItems.map(({ id, label }) => ({ id: `go-${id}`, group: 'Go to', label, icon: 'arrowRight', keywords: 'section', run: () => goTo(id) })),
    { id: 'go-home', group: 'Go to', label: 'Top of the page', icon: 'arrowUp', keywords: 'home hero start', run: () => goTo('home') },

    ...projects.flatMap((project) => [
      {
        id: `case-${project.id}`,
        group: 'Projects',
        label: `Read the ${project.name} case study`,
        icon: 'layout',
        keywords: `${project.tagline} ${project.type}`,
        run: () => window.location.assign(`#project-${project.id}`),
      },
      live(project) && {
        id: `visit-${project.id}`,
        group: 'Projects',
        label: `Open ${project.name} live`,
        hint: displayUrl(live(project).url),
        icon: 'external',
        keywords: 'website visit',
        run: () => window.open(live(project).url, '_blank', 'noopener'),
      },
    ]),

    { id: 'copy-email', group: 'Actions', label: 'Copy email address', hint: profile.email, icon: 'copy', keywords: 'contact mail', terminal: true,
      run: async () => {
        try {
          await navigator.clipboard.writeText(profile.email);
          return [`✔ Copied ${profile.email}`];
        } catch {
          return [`Couldn't reach the clipboard. The address is ${profile.email}`];
        }
      } },
    { id: 'resume', group: 'Actions', label: 'View résumé', icon: 'file', keywords: 'cv resume read print', run: openResume },
    { id: 'resume-pdf', group: 'Actions', label: 'Download résumé (PDF)', icon: 'download', keywords: 'cv resume save', run: downloadResume },
    ...certificates.map((cert) => ({
      id: `cert-${cert.id}`,
      group: 'Actions',
      label: `View ${cert.kind === 'Diploma' ? 'diploma' : cert.kind}`,
      hint: cert.date,
      icon: 'award',
      keywords: cert.id === 'diploma' ? 'certificate graduation degree' : 'certificate internship training completion',
      run: () => {
        goTo('certificates');
        setTimeout(() => openCertificate(cert.id), 700);
      },
    })),
    { id: 'fit', group: 'Actions', label: 'Check how I fit your job', icon: 'briefcase', keywords: 'hiring recruiter role match job post',
      run: () => {
        goTo('fit');
        setTimeout(() => document.getElementById('fit-post')?.focus({ preventScroll: true }), 700);
      } },
    { id: 'message', group: 'Actions', label: 'Send a message', icon: 'mail', keywords: 'contact form hire',
      run: () => {
        goTo('contact');
        setTimeout(() => document.getElementById('contact-name')?.focus({ preventScroll: true }), 700);
      } },
    { id: 'theme', group: 'Actions', label: 'Switch light / dark theme', icon: 'moon', keywords: 'dark light mode colour color', run: () => toggleTheme() },
    { id: 'flip', group: 'Actions', label: 'Flip the photo', icon: 'rotate', keywords: 'graduation portrait picture',
      run: () => {
        goTo('home');
        setTimeout(() => window.dispatchEvent(new Event('portfolio:flip')), 500);
      } },
    canTiltWithDevice() && { id: 'tilt', group: 'Actions', label: 'Tilt with my phone', icon: 'phone', keywords: 'motion gyroscope', terminal: true,
      run: async () => ((await enableDeviceTilt()) ? ['✔ Motion tilt is on. Tip your phone.'] : ['Motion access was not allowed.']) },

    { id: 'whoami', group: 'Terminal', label: 'whoami', mono: true, terminal: true,
      run: () => [profile.name, profile.role, profile.location, `status: ${profile.availability.toLowerCase()}`] },
    { id: 'ls', group: 'Terminal', label: 'ls projects', mono: true, terminal: true,
      run: () => projects.map((p) => `${p.name.padEnd(10)} ${p.year}  ${p.status?.toLowerCase() ?? ''}  ${p.tagline}`) },
    { id: 'ping', group: 'Terminal', label: 'ping live sites', mono: true, terminal: true, keywords: 'uptime status',
      run: async () =>
        Promise.all(
          projects.filter(live).map(async (p) => {
            const { up, ms } = await ping(live(p).url);
            return up ? `✔ ${displayUrl(live(p).url)}  ${ms} ms` : `✕ ${displayUrl(live(p).url)}  no response`;
          }),
        ) },
    { id: 'lp', group: 'Terminal', label: 'lp resume.pdf', mono: true, keywords: 'print cv',
      lines: ['request id is felix-1 (1 file)', '→ Printing…'],
      run: openResume },
    { id: 'sudo', group: 'Terminal', label: 'sudo hire felix', mono: true, keywords: 'recruit job offer',
      lines: ['[sudo] password for recruiter: ••••••••', '✔ Permission granted.', '→ Opening the contact form…'],
      run: () => {
        goTo('contact');
        setTimeout(() => confetti(), 500);
      } },
    { id: 'help', group: 'Terminal', label: 'help', mono: true, terminal: true,
      run: () => [
        'Type to filter, ↑ ↓ to move, Enter to run, Esc to close.',
        'Try: whoami · ls projects · ping live sites · lp resume.pdf · sudo hire felix',
        `Open this palette any time with ${paletteShortcut()} or /`,
      ] },
  ].filter(Boolean);
}

export function CommandPalette() {
  const dialogRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [output, setOutput] = useState(null);
  const commands = useMemo(() => buildCommands(), []);

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return commands;
    // Every word must match somewhere; words found in the title rank higher.
    const ranked = commands
      .map((cmd) => {
        const text = `${cmd.label} ${cmd.keywords ?? ''} ${cmd.group} ${cmd.hint ?? ''}`.toLowerCase();
        if (!words.every((word) => text.includes(word))) return null;
        return { cmd, score: words.filter((word) => cmd.label.toLowerCase().includes(word)).length };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map(({ cmd }) => cmd);
    // Keep groups together, so the arrow keys follow the order on screen.
    const groupOrder = [...new Set(ranked.map((cmd) => cmd.group))];
    return groupOrder.flatMap((group) => ranked.filter((cmd) => cmd.group === group));
  }, [commands, query]);

  // Ctrl/⌘ + K toggles, "/" opens (unless typing), and other parts of the page can ask it to open.
  useEffect(() => {
    const onKey = (event) => {
      const typing = event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]');
      if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === '/' && !typing) {
        event.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('portfolio:palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('portfolio:palette', onOpen);
    };
  }, []);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      setQuery('');
      setActive(0);
      setOutput(null);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Keep the highlighted option in view.
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, results]);

  const run = async (cmd) => {
    if (!cmd) return;
    if (cmd.terminal) {
      setOutput({ command: cmd.label, lines: ['…'] });
      const lines = await cmd.run();
      setOutput({ command: cmd.label, lines });
      return;
    }
    if (cmd.lines) {
      // Print first, then act.
      setOutput({ command: cmd.label, lines: cmd.lines });
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
    setOpen(false);
    setTimeout(cmd.run, 0);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((index) => (results.length ? (index + step + results.length) % results.length : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(results[active]);
    }
  };

  const groups = [...new Set(results.map((cmd) => cmd.group))];
  const activeId = results[active] ? `cmd-${results[active].id}` : undefined;

  return (
    <dialog
      ref={dialogRef}
      className="palette"
      aria-label="Command palette"
      onClose={(event) => event.target === dialogRef.current && setOpen(false)}
      onClick={(event) => event.target === dialogRef.current && setOpen(false)}
    >
      <div className="palette-box">
        <div className="palette-search">
          <Icon name="search" size={18} />
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={activeId}
            aria-label="Search commands"
            placeholder="Search or type a command…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              setOutput(null);
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck="false"
          />
          <button type="button" className="palette-esc" onClick={() => setOpen(false)}>
            Esc<span className="visually-hidden"> (close)</span>
          </button>
        </div>

        {output ? (
          <div className="palette-output" role="status">
            <p className="palette-prompt">
              <span aria-hidden="true">$</span> {output.command}
            </p>
            {output.lines.map((line, i) => (
              <p key={i} style={{ '--i': i }}>
                {line}
              </p>
            ))}
          </div>
        ) : null}

        <div id="palette-list" ref={listRef} className="palette-list" role="listbox" aria-label="Commands">
          {results.length === 0 && <p className="palette-empty">No matches. Try “help”.</p>}
          {groups.map((group) => (
            <div key={group} role="group" aria-label={group}>
              <p className="palette-group" aria-hidden="true">
                {group}
              </p>
              {results
                .filter((cmd) => cmd.group === group)
                .map((cmd) => {
                  const index = results.indexOf(cmd);
                  return (
                    <div
                      key={cmd.id}
                      id={`cmd-${cmd.id}`}
                      role="option"
                      aria-selected={index === active}
                      className={`palette-option${cmd.mono ? ' is-mono' : ''}`}
                      onMouseMove={() => index !== active && setActive(index)}
                      onClick={() => run(cmd)}
                    >
                      <Icon name={cmd.mono ? 'terminal' : cmd.icon} size={16} />
                      <span className="palette-label">{cmd.label}</span>
                      {cmd.hint && <span className="palette-hint">{cmd.hint}</span>}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>

        <p className="palette-footer" aria-hidden="true">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>Enter</kbd> run
          </span>
          <span>
            <kbd>{paletteShortcut()}</kbd> toggle
          </span>
        </p>
      </div>
    </dialog>
  );
}
