import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MuruScene } from './MuruScene';

describe('MuruScene moods', () => {
  it('applies distinct visual classes to walking and reward moods', () => {
    const { container, rerender } = render(<MuruScene lineProgress={0.5} mood="walking" />);
    const walkingScene = container.querySelector('.muru-scene');
    const walkingImage = container.querySelector('.muru-image');
    expect(walkingScene).toHaveClass('mood-walking');
    expect(walkingImage).toHaveClass('muru-image--walking');

    rerender(<MuruScene lineProgress={1} mood="reward" />);
    expect(container.querySelector('.muru-scene')).toHaveClass('mood-reward');
    expect(container.querySelector('.muru-image')).toHaveClass('muru-image--reward');
    expect(container.querySelector('.muru-image')).not.toHaveClass('muru-image--walking');
  });
});
