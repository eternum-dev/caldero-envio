import { Composition } from 'remotion';
import { DemoCalculadora } from './DemoCalculadora';
import { totalDurationInFrames } from './data';

export const FPS = 30;
// El duration se calcula desde data.js para que coincida con el timing de las
// scenes. Si agregás una scene o cambiás una duración, esto se actualiza solo.
export const DURATION_IN_FRAMES = totalDurationInFrames;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720; // 16:9

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="DemoCalculadora"
        component={DemoCalculadora}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
}