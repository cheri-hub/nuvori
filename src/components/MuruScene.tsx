type MuruMood = 'idle' | 'walking' | 'reward';

type MuruSceneProps = {
  lineProgress: number;
  mood: MuruMood;
};

export function MuruScene({ lineProgress, mood }: MuruSceneProps) {
  const progress = Math.min(1, Math.max(0, lineProgress));
  return (
    <div className={`muru-scene mood-${mood}`} style={{ '--line-progress': progress } as React.CSSProperties}>
      <img className="muru-image" src="/assets/muru-idle.svg" alt="Muru, seu companheiro de jornada" />
      <svg className="first-step-line" viewBox="0 0 280 90" role="img" aria-label="Primeiro passo" data-line-progress={progress}>
        <path className="line-track" d="M16 63 C48 22, 78 78, 112 43 S174 12, 195 48 S240 70, 264 26" />
        <path className="line-lit" pathLength="1" d="M16 63 C48 22, 78 78, 112 43 S174 12, 195 48 S240 70, 264 26" />
      </svg>
    </div>
  );
}
