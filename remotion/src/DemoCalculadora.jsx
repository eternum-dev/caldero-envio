// Composition DemoCalculadora — secuencia las 7 escenas del video.
// Replica el flujo principal de la calculadora de Caldero Envío en un MP4
// de ~22 segundos que se coloca en el slot <VideoPlayer> de la home.

import { Sequence } from 'remotion';
import { tokens, timing } from './data';
import { EmptyCalculator } from './scenes/EmptyCalculator';
import { TypingAddress } from './scenes/TypingAddress';
import { AutocompleteSelect } from './scenes/AutocompleteSelect';
import { SelectingCourier } from './scenes/SelectingCourier';
import { ClickingCalculate } from './scenes/ClickingCalculate';
import { Calculating } from './scenes/Calculating';
import { ResultWithRoute } from './scenes/ResultWithRoute';
import { Reset } from './scenes/Reset';

export function DemoCalculadora() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: tokens.bgPageWarm,
        fontFamily: tokens.fontSans,
        color: tokens.ink,
        overflow: 'hidden',
      }}
    >
      <Sequence from={timing.scene1Empty.start} durationInFrames={timing.scene1Empty.duration}>
        <EmptyCalculator />
      </Sequence>

      <Sequence from={timing.scene2Typing.start} durationInFrames={timing.scene2Typing.duration}>
        <TypingAddress />
      </Sequence>

      <Sequence
        from={timing.scene3Autocomplete.start}
        durationInFrames={timing.scene3Autocomplete.duration}
      >
        <AutocompleteSelect />
      </Sequence>

      <Sequence
        from={timing.scene4Courier.start}
        durationInFrames={timing.scene4Courier.duration}
      >
        <SelectingCourier />
      </Sequence>

      <Sequence
        from={timing.scene5Calculate.start}
        durationInFrames={timing.scene5Calculate.duration}
      >
        <ClickingCalculate />
      </Sequence>

      <Sequence
        from={timing.scene6Calculating.start}
        durationInFrames={timing.scene6Calculating.duration}
      >
        <Calculating />
      </Sequence>

      <Sequence
        from={timing.scene7Result.start}
        durationInFrames={timing.scene7Result.duration}
      >
        <ResultWithRoute />
      </Sequence>

      <Sequence
        from={timing.scene8Reset.start}
        durationInFrames={timing.scene8Reset.duration}
      >
        <Reset />
      </Sequence>
    </div>
  );
}