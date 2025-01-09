import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';


export const ImageControlsV2 = ({image, name}) => {
    const canvasRef = useRef();
    const [gamma, setGamma] = useState(1);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current);
        console.log(canvas);
        const img = new Image();
        img.src = image;
        
        img.onload = () => {
            const fabricImage = new fabric.Image(img);
            canvas.add(fabricImage);

            const brightnessFilter = new fabric.filters.Convolute({
                matrix: [0, gamma, 0, gamma, 5, gamma, 0, gamma, 0]
            });

            const blurFilter = new fabric.filters.Blur()
            fabricImage.filters.push(brightnessFilter);
            fabricImage.applyFilters();
            canvas.renderAll();
        }

        return () => canvas.dispose();
    }, [image, gamma]);

    return (
        <div 
            style= 
                {{
                    "display": "flex", 
                    "flexDirection": "column", 
                    "gap": "1em",
                    "width": "50%",
                    "justifyContent": "center",
                    "alignItems": "center"
                }}
        >
            <h>{name}: Image Controls With Fabric JS </h>
            <div style={{"display":"flex", "gap":"1em"}}>
                <label>
                    Gamma:
                </label>
                <input 
                    style = {{width: "5em"}}
                    type="text" 
                    value={gamma} 
                    onChange={(e) => setGamma(e.target.value)} 
                />
            </div>
            <canvas ref={canvasRef} width={"1000"} height={"1000"}/>
        </div>
    )
}