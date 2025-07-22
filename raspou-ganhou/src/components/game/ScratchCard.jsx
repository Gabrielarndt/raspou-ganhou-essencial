import React, { useRef, useEffect, useState } from 'react';

const ScratchCard = ({ prizes, winningPrizes, onReveal, isRevealed }) => {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);

  useEffect(() => {
    if (isRevealed) {
      revealAll();
    } else {
      initializeCanvas();
    }
  }, [isRevealed, prizes]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 200;

    // Primeiro, desenhar o fundo com os prêmios (isso fica por baixo)
    drawPrizes(ctx);

    // Depois, desenhar a camada de raspagem por cima
    const gradient = ctx.createLinearGradient(0, 0, 300, 200);
    gradient.addColorStop(0, '#C0C0C0');
    gradient.addColorStop(1, '#A0A0A0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Adicionar texto "Raspe aqui!"
    ctx.fillStyle = '#666';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Raspe aqui!', canvas.width / 2, canvas.height / 2);
  };

  const drawPrizes = (ctx) => {
    // Desenhar fundo escuro
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Desenhar borda dourada
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, ctx.canvas.width - 10, ctx.canvas.height - 10);
    
    // Desenhar os prêmios em uma grade 3x3
    const cellWidth = (ctx.canvas.width - 20) / 3;
    const cellHeight = (ctx.canvas.height - 20) / 3;
    
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    prizes.forEach((prize, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = 15 + col * cellWidth + cellWidth / 2;
      const y = 15 + row * cellHeight + cellHeight / 2;
      
      // Destacar prêmios vencedores
      if (winningPrizes.includes(index)) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(15 + col * cellWidth + 2, 15 + row * cellHeight + 2, cellWidth - 4, cellHeight - 4);
        ctx.fillStyle = '#000';
        ctx.fillText(prize, x, y);
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.fillText(prize, x, y);
      }
    });
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Usar 'destination-out' para "apagar" a camada de raspagem
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.fill();

    // Calcular porcentagem raspada
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const percentage = (transparentPixels / (canvas.width * canvas.height)) * 100;
    setScratchedPercentage(percentage);

    // Se raspou mais de 95%, revelar automaticamente
    if (percentage > 95) {
      revealAll();
      onReveal();
    }
  };

  const revealAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Limpar o canvas e desenhar apenas os prêmios
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    drawPrizes(ctx);
    
    setIsScratching(false);
    setScratchedPercentage(100);
  };

  const getMouseCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
  };

  const handleMouseDown = (event) => {
    if (isRevealed) return;
    setIsScratching(true);
    const { x, y } = getMouseCoordinates(event);
    scratch(x, y);
  };

  const handleMouseMove = (event) => {
    if (isRevealed || !isScratching) return;
    const { x, y } = getMouseCoordinates(event);
    scratch(x, y);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleMouseLeave = () => {
    setIsScratching(false);
  };

  // Eventos touch para mobile
  const handleTouchStart = (event) => {
    if (isRevealed) return;
    setIsScratching(true);
    const { x, y } = getMouseCoordinates(event);
    scratch(x, y);
  };

  const handleTouchMove = (event) => {
    if (isRevealed || !isScratching) return;
    const { x, y } = getMouseCoordinates(event);
    scratch(x, y);
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative bg-gray-900 p-4 rounded-lg">
        <canvas
          ref={canvasRef}
          className="border-2 border-yellow-400 rounded cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        />
        
        {scratchedPercentage > 0 && scratchedPercentage < 95 && !isRevealed && (
          <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 px-2 py-1 rounded text-sm font-bold">
            {Math.round(scratchedPercentage)}%
          </div>
        )}
      </div>

      <div className="text-center">
        {!isRevealed ? (
          <p className="text-gray-300 text-sm">
            Use o mouse ou dedo para raspar
          </p>
        ) : (
          <p className="text-green-400 text-sm font-bold">
            Resultado revelado!
          </p>
        )}
      </div>
    </div>
  );
};

export default ScratchCard;

