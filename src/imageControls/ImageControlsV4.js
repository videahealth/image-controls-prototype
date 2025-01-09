import React, { useMemo } from 'react';

import { Stage, Sprite, Container } from "@pixi/react";
import { BlurFilter, ColorMatrixFilte } from 'pixi.js';

export const ImageControlsV4 = ({image, name}) => {
    // const canvasRef = useRef();
    const blurFilter = useMemo(() => new BlurFilter(5), []);
    const colorMatrix = new ColorMatrixFilte();
    //colorMatrix.contrast(-0.6);

    return (
       <Stage width={1000} height={1000}>
        <Container>
            <Sprite 
                image={image} 
                x={500} 
                y={500} 
                scale={0.5}
                anchor={[0.5, 0.5]} 
                filters={[blurFilter, colorMatrix]}
            />
        </Container>
      </Stage>
    )
}