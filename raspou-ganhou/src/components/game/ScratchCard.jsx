import React, { useRef, useEffect, useState } from 'react';

const ScratchCard = ({ prizes, winningPrizes, onReveal, isRevealed }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 });

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    if (isRevealed) {
      revealAll();
    } else {
      initializeCanvas();
    }
  }, [isRevealed, prizes, canvasSize]);

  const updateCanvasSize = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // Mobile: usar quase toda a largura disponível
        const width = Math.min(containerWidth - 20, 380);
        const height = Math.round(width * 0.75); // Proporção 4:3
        setCanvasSize({ width, height });
      } else {
        // Desktop: tamanho maior
        const width = Math.min(containerWidth - 40, 500);
        const height = Math.round(width * 0.7); // Proporção mais larga para desktop
        setCanvasSize({ width, height });
      }
    }
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Primeiro, desenhar o fundo com os prêmios
    drawPrizes(ctx);

    // Depois, desenhar a camada de raspagem por cima
    drawScratchLayer(ctx);
  };

  const drawPrizes = (ctx) => {
    // Desenhar fundo escuro com gradiente
    const bgGradient = ctx.createRadialGradient(
      ctx.canvas.width / 2, ctx.canvas.height / 2, 0,
      ctx.canvas.width / 2, ctx.canvas.height / 2, Math.max(ctx.canvas.width, ctx.canvas.height) / 2
    );
    bgGradient.addColorStop(0, '#1a1a1a');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Desenhar borda dourada mais espessa
    const borderWidth = Math.max(4, ctx.canvas.width / 80);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth/2, borderWidth/2, ctx.canvas.width - borderWidth, ctx.canvas.height - borderWidth);
    
    // Desenhar borda interna
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = Math.max(2, borderWidth / 2);
    const innerBorder = borderWidth * 2;
    ctx.strokeRect(innerBorder, innerBorder, ctx.canvas.width - innerBorder * 2, ctx.canvas.height - innerBorder * 2);
    
    // Calcular tamanho das células da grade 3x3
    const padding = borderWidth * 4;
    const cellWidth = (ctx.canvas.width - padding * 2) / 3;
    const cellHeight = (ctx.canvas.height - padding * 2) / 3;
    
    // Desenhar linhas da grade para separar as células
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = Math.max(1, borderWidth / 4);
    
    // Linhas verticais
    for (let i = 1; i < 3; i++) {
      const x = padding + i * cellWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, ctx.canvas.height - padding);
      ctx.stroke();
    }
    
    // Linhas horizontais
    for (let i = 1; i < 3; i++) {
      const y = padding + i * cellHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(ctx.canvas.width - padding, y);
      ctx.stroke();
    }
    
    // Tamanho da fonte baseado no tamanho da célula
    const fontSize = Math.max(24, Math.min(cellWidth / 2, cellHeight / 2));
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    prizes.forEach((prize, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = padding + col * cellWidth + cellWidth / 2;
      const y = padding + row * cellHeight + cellHeight / 2;
      
      // Desenhar fundo da célula
      const cellPadding = 6;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
      ctx.fillRect(
        padding + col * cellWidth + cellPadding, 
        padding + row * cellHeight + cellPadding, 
        cellWidth - cellPadding * 2, 
        cellHeight - cellPadding * 2
      );
      
      // Destacar prêmios vencedores com efeito brilhante
      if (winningPrizes.includes(index)) {
        // Fundo dourado brilhante
        const winGradient = ctx.createRadialGradient(x, y, 0, x, y, cellWidth / 2);
        winGradient.addColorStop(0, '#FFD700');
        winGradient.addColorStop(0.7, '#FFA500');
        winGradient.addColorStop(1, '#FF8C00');
        ctx.fillStyle = winGradient;
        ctx.fillRect(
          padding + col * cellWidth + cellPadding, 
          padding + row * cellHeight + cellPadding, 
          cellWidth - cellPadding * 2, 
          cellHeight - cellPadding * 2
        );
        
        // Borda brilhante
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          padding + col * cellWidth + cellPadding, 
          padding + row * cellHeight + cellPadding, 
          cellWidth - cellPadding * 2, 
          cellHeight - cellPadding * 2
        );
        
        // Texto do prêmio vencedor
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeText(prize, x, y);
        ctx.fillText(prize, x, y);
      } else {
        // Prêmios normais
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(prize, x, y);
        ctx.fillText(prize, x, y);
      }
    });
  };

  const drawScratchLayer = (ctx) => {
    // Desenhar camada de raspagem opaca
    const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
    gradient.addColorStop(0, '#E0E0E0');
    gradient.addColorStop(0.3, '#D0D0D0');
    gradient.addColorStop(0.7, '#C0C0C0');
    gradient.addColorStop(1, '#B0B0B0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Adicionar textura à camada de raspagem
    ctx.fillStyle = 'rgba(120, 120, 120, 0.6)';
    for (let i = 0; i < ctx.canvas.width; i += 6) {
      for (let j = 0; j < ctx.canvas.height; j += 6) {
        if (Math.random() > 0.6) {
          ctx.fillRect(i, j, 3, 3);
        }
      }
    }

    // Adicionar texto "Raspe aqui!"
    const fontSize = Math.max(18, Math.min(32, ctx.canvas.width / 12));
    ctx.fillStyle = '#444';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.strokeText('Raspe aqui!', ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.fillText('Raspe aqui!', ctx.canvas.width / 2, ctx.canvas.height / 2);
  };


  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Salvar o estado atual do contexto
    ctx.save();
    
    // Usar 'destination-out' para "apagar" apenas a camada de raspagem
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    const scratchRadius = Math.max(20, canvas.width / 20); // Raio responsivo maior
    ctx.arc(x, y, scratchRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Restaurar o estado do contexto
    ctx.restore();

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

    // Se raspou mais de 85%, revelar automaticamente
    if (percentage > 85) {
      revealAll();
      onReveal();
    }
  };

  const revealAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Limpar completamente o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Resetar o modo de composição
    ctx.globalCompositeOperation = 'source-over';
    
    // Desenhar apenas os prêmios (sem a camada de raspagem)
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

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  };

  const handleMouseDown = (event) => {
    if (isRevealed) return;
    event.preventDefault();
    setIsScratching(true);
    const { x, y } = getMouseCoordinates(event);
    scratch(x, y);
  };

  const handleMouseMove = (event) => {
    if (isRevealed || !isScratching) return;
    event.preventDefault();
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
    event.preventDefault();
    setIsScratching(true);
    const { x, y } = getMouseCoordinates(event);
    scratch(x, y);
  };

  const handleTouchMove = (event) => {
    if (isRevealed || !isScratching) return;
    event.preventDefault();
    const { x, y } = getMouseCoordinates(event);
    scratch(x, y);
  };

  const handleTouchEnd = (event) => {
    event.preventDefault();
    setIsScratching(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full" ref={containerRef}>
      <div className="relative bg-gray-900 p-3 md:p-6 rounded-xl shadow-2xl w-full max-w-2xl">
        <canvas
          ref={canvasRef}
          className="border-2 border-yellow-400 rounded-lg cursor-pointer w-full h-auto shadow-lg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            touchAction: 'none',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
        
        {scratchedPercentage > 0 && scratchedPercentage < 85 && !isRevealed && (
          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/90 text-yellow-400 px-2 py-1 md:px-3 md:py-2 rounded-lg text-sm md:text-base font-bold border border-yellow-400/30">
            {Math.round(scratchedPercentage)}%
          </div>
        )}
        
        {winningPrizes.length > 0 && isRevealed && (
          <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-green-600/90 text-white px-2 py-1 md:px-3 md:py-2 rounded-lg text-sm md:text-base font-bold animate-pulse">
            🎉 GANHOU!
          </div>
        )}
      </div>

      <div className="text-center px-4">
        {!isRevealed ? (
          <div className="space-y-2">
            <p className="text-gray-300 text-sm md:text-base">
              {window.innerWidth < 768 ? 'Toque e arraste para raspar' : 'Use o mouse para raspar'}
            </p>
            <p className="text-yellow-400 text-xs md:text-sm">
              Encontre 3 símbolos iguais para ganhar!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-green-400 text-sm md:text-base font-bold">
              🎯 Resultado revelado!
            </p>
            {winningPrizes.length > 0 && (
              <p className="text-yellow-400 text-xs md:text-sm animate-bounce">
                Parabéns! Você encontrou uma combinação vencedora! 🏆
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchCard;