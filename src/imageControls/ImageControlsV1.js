import React, { useEffect, useRef, useState } from 'react';


export const ImageControlsV1 = ({image, name}) => {
    const canvasRef = useRef();
    const [gamma, setGamma] = useState(1);
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(1);

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d');
        const img = new Image();
        img.src = image;
        img.onload = () => {
            context.drawImage(img, 0, 0, 1000, 1000);
            if (isNaN(Number(brightness)) || isNaN(Number(contrast) || isNaN(Number(gamma)))) {
                return;
            }
            applyWWWLCorrection(Number(brightness), Number(contrast));
            applyGammaCorrection(Number(gamma));
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gamma, brightness, contrast]);


    const applyGammaCorrection = (gamma) => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = gammaCorrection(data[i], gamma); // Red
            data[i + 1] = gammaCorrection(data[i+1], gamma); // Green
            data[i + 2] = gammaCorrection(data[i+2], gamma); // Blue
        }

        context.putImageData(imageData, 0, 0);
    }

    const applyWWWLCorrection = (brightness, contrast) => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = brightnessAndContrast(data[i], brightness, contrast); // Red
            data[i + 1] = brightnessAndContrast(data[i + 1], brightness, contrast); // Green
            data[i + 2] = brightnessAndContrast(data[i + 2], brightness, contrast); // Blue
        }

        context.putImageData(imageData, 0, 0);
    }


    const brightnessAndContrast = (value, brightness, contrast) => {
        const newValue = (value * contrast) + brightness;
        if (newValue < 0) {
            return 0;
        }
        if (newValue > 255) {
            return 255;
        }
        return Math.floor(newValue);
    }

    const gammaCorrection = (value, gamma) => {
        return Math.pow(value / 255, gamma) * 255;
    }

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
            <h>{name}: Gamma Manipulation Prototype </h>
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
            <div style={{"display":"flex", "gap":"1em"}}>
                <label>
                    Brightness:
                </label>
                <input 
                    style = {{width: "5em"}}
                    type="text" 
                    value={brightness} 
                    onChange={(e) => setBrightness(e.target.value)} 
                />
            </div>
            <div style={{"display":"flex", "gap":"1em"}}>
                <label>
                    Contrast:
                </label>
                <input 
                    style = {{width: "5em"}}
                    type="text" 
                    value={contrast} 
                    onChange={(e) => setContrast(e.target.value)} 
                />
            </div>
            <canvas ref={canvasRef} width={"1000"} height={"1000"}/>
        </div>
    )
}