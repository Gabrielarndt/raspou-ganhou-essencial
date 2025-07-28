import React, { useRef, useEffect, useState } from 'react';

const ScratchCard = ({ prizes, winningPrizes, onReveal, isRevealed }) => {
  const canvasRef = useRef(null);
  const backgroundCanvasRef = useRef(null);
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
      initializeCanvases();
    }
  }, [isRevealed, prizes, canvasSize]);

  const updateCanvasSize = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        const width = Math.min(containerWidth - 20, 380);
        const height = Math.round(width * 0.75);
        setCanvasSize({ width, height });
      } else {
        const width = Math.min(containerWidth - 40, 500);
        const height = Math.round(width * 0.7);
        setCanvasSize({ width, height });
      }
    }
  };

  const initializeCanvases = () => {
    const backgroundCanvas = backgroundCanvasRef.current;
    const scratchCanvas = canvasRef.current;
    
    if (!backgroundCanvas || !scratchCanvas) return;

    // Configurar tamanhos
    backgroundCanvas.width = canvasSize.width;
    backgroundCanvas.height = canvasSize.height;
    scratchCanvas.width = canvasSize.width;
    scratchCanvas.height = canvasSize.height;

    // Desenhar o fundo com os ícones
    drawGameBoard(backgroundCanvas.getContext('2d'));
    
    // Desenhar a camada de raspagem
    drawScratchLayer(scratchCanvas.getContext('2d'));
  };

  // Função para verificar padrões vencedores
  const checkWinningPatterns = (symbols) => {
    const winningPatterns = [
      [0, 1, 2], // Linha superior
      [3, 4, 5], // Linha meio
      [6, 7, 8], // Linha inferior
      [0, 3, 6], // Coluna esquerda
      [1, 4, 7], // Coluna meio
      [2, 5, 8], // Coluna direita
      [0, 4, 8], // Diagonal principal
      [2, 4, 6]  // Diagonal secundária
    ];

    for (const pattern of winningPatterns) {
      const [a, b, c] = pattern;
      if (symbols[a] && symbols[a] === symbols[b] && symbols[b] === symbols[c]) {
        return pattern;
      }
    }
    return [];
  };

  const drawGameBoard = (ctx) => {
    // Fundo escuro
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Borda dourada externa
    const borderWidth = Math.max(4, ctx.canvas.width / 80);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth/2, borderWidth/2, ctx.canvas.width - borderWidth, ctx.canvas.height - borderWidth);
    
    // Área interna da grade
    const padding = borderWidth * 3;
    const gridWidth = ctx.canvas.width - padding * 2;
    const gridHeight = ctx.canvas.height - padding * 2;
    const cellWidth = gridWidth / 3;
    const cellHeight = gridHeight / 3;
    
    // Desenhar fundo da grade
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(padding, padding, gridWidth, gridHeight);
    
    // Desenhar linhas da grade
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    
    // Linhas verticais
    for (let i = 1; i < 3; i++) {
      const x = padding + i * cellWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + gridHeight);
      ctx.stroke();
    }
    
    // Linhas horizontais
    for (let i = 1; i < 3; i++) {
      const y = padding + i * cellHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + gridWidth, y);
      ctx.stroke();
    }
    
    // Desenhar os ícones em cada célula
    const fontSize = Math.max(32, Math.min(cellWidth / 2.5, cellHeight / 2.5));
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    prizes.forEach((prize, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = padding + col * cellWidth + cellWidth / 2;
      const y = padding + row * cellHeight + cellHeight / 2;
      
      // Fundo da célula
      if (winningPrizes.includes(index)) {
        // Célula vencedora - fundo dourado
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, cellWidth / 3);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = gradient;
        ctx.fillRect(
          padding + col * cellWidth + 4, 
          padding + row * cellHeight + 4, 
          cellWidth - 8, 
          cellHeight - 8
        );
        
        // Borda brilhante
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          padding + col * cellWidth + 4, 
          padding + row * cellHeight + 4, 
          cellWidth - 8, 
          cellHeight - 8
        );
      } else {
        // Célula normal - fundo escuro
        ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
        ctx.fillRect(
          padding + col * cellWidth + 4, 
          padding + row * cellHeight + 4, 
          cellWidth - 8, 
          cellHeight - 8
        );
      }
      
      // Desenhar o ícone
      if (winningPrizes.includes(index)) {
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeText(prize, x, y);
        ctx.fillText(prize, x, y);
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeText(prize, x, y);
        ctx.fillText(prize, x, y);
      }
    });
  };

  const drawScratchLayer = (ctx) => {
    // Criar gradiente para a camada de raspagem
    const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
    gradient.addColorStop(0, '#D5D5D5');
    gradient.addColorStop(0.3, '#C8C8C8');
    gradient.addColorStop(0.7, '#BABABA');
    gradient.addColorStop(1, '#ADADAD');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Adicionar textura
    ctx.fillStyle = 'rgba(140, 140, 140, 0.4)';
    for (let i = 0; i < ctx.canvas.width; i += 6) {
      for (let j = 0; j < ctx.canvas.height; j += 6) {
        if (Math.random() > 0.6) {
          ctx.fillRect(i, j, 3, 3);
        }
      }
    }

    // Texto "Raspe aqui!"
    const fontSize = Math.max(18, Math.min(32, ctx.canvas.width / 12));
    ctx.fillStyle = '#666';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeText('Raspe aqui!', ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.fillText('Raspe aqui!', ctx.canvas.width / 2, ctx.canvas.height / 2);
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Usar destination-out para "apagar" a camada de raspagem
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    const scratchRadius = Math.max(25, canvas.width / 18);
    ctx.arc(x, y, scratchRadius, 0, 2 * Math.PI);
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
    
    // Limpar completamente a camada de raspagem
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
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
        {/* Canvas de fundo com os ícones */}
        <canvas
          ref={backgroundCanvasRef}
          className="absolute top-3 left-3 md:top-6 md:left-6 border-2 border-yellow-400 rounded-lg w-[calc(100%-24px)] md:w-[calc(100%-48px)] h-auto shadow-lg"
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            zIndex: 1
          }}
        />
        
        {/* Canvas de raspagem (por cima) */}
        <canvas
          ref={canvasRef}
          className="relative border-2 border-yellow-400 rounded-lg cursor-pointer w-full h-auto shadow-lg"
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
            height: 'auto',
            zIndex: 2
          }}
        />
        
        {scratchedPercentage > 0 && scratchedPercentage < 95 && !isRevealed && (
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