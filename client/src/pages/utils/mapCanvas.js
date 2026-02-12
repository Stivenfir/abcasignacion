export const syncCanvasToImage = (canvas, image) => {
  if (!canvas || !image) return;

  const width = image.clientWidth;
  const height = image.clientHeight;

  if (!width || !height) return;

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
};

export const getCanvasPointFromEvent = (event, canvas) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: Number(((event.clientX - rect.left) * scaleX).toFixed(2)),
    y: Number(((event.clientY - rect.top) * scaleY).toFixed(2)),
  };
};

export const drawGrid = (ctx, canvas, enabled, gridSize = 20) => {
  if (!enabled) return;

  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 0.5;

  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
};

export const drawDelimitaciones = (ctx, delimitaciones) => {
  delimitaciones.forEach((d) => {
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)";

    ctx.fillRect(
      Number(d.PosicionX),
      Number(d.PosicionY),
      Number(d.Ancho),
      Number(d.Alto),
    );

    ctx.strokeRect(
      Number(d.PosicionX),
      Number(d.PosicionY),
      Number(d.Ancho),
      Number(d.Alto),
    );

    ctx.setLineDash([]);
  });
};

export const drawPuesto = (ctx, puesto, color = "#9CA3AF") => {
  ctx.beginPath();
  ctx.arc(Number(puesto.UbicacionX), Number(puesto.UbicacionY), 8, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = color === "#9CA3AF" ? "#6B7280" : "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 10px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(puesto.NoPuesto, Number(puesto.UbicacionX), Number(puesto.UbicacionY));
};

export const drawSelectedPuesto = (ctx, x, y, label) => {
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, 8, 0, 2 * Math.PI);
  ctx.fillStyle = "#3B82F6";
  ctx.fill();
  ctx.strokeStyle = "#1D4ED8";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y);
};
