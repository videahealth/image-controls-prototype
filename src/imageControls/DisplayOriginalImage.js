import React, { useEffect, useRef} from 'react';


export const DisplayOriginalImage = ({image, name}) => {
    const canvasRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d');
        const img = new Image();
        img.src = image;
        img.onload = () => {
            context.drawImage(img, 0, 0, 500, 500);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


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
            <h>{name}</h>
            <canvas ref={canvasRef} width={"500"} height={"500"}/>
        </div>
    )
}