export const getRepeatPieces = function (data) {
  const array = [];
  let position = 1;
  // get left top pixel as base
  const base = getPixelSignature(data.slice(0, 4));
  let currentPixel = base;
  // read .9 config
  for (let i = 4; i <= data.length - 8; i += 4) {
    const pixelSig = getPixelSignature(data.slice(i, i + 4));
    if (pixelSig !== currentPixel) {
      array.push({
        start: position,
        end: i / 4,
        repeat: currentPixel !== base
      });
      currentPixel = pixelSig;
      position = i / 4;
    }
  }
  array.push({
    start: position,
    end: (data.length - 4) / 4,
    repeat: currentPixel !== base
  });
  return array;
}

const getPixelSignature = function (data) {
  return data.join(",");
}

export const drawPiece = function (context, widthFactor, heightFactor, image, x, y, w, h, dx, dy) {
  context.drawImage(image, x, y, w, h, dx, dy, Math.floor(w * (widthFactor || 1)), Math.floor(h * (heightFactor || 1)));
}

export const getPadding = function (markData, canvas) {
  const horiPadding = getPaddingEndPoints(
    markData.contentHorizontal,
    markData.repeatHorizontal
  );
  const vertPadding = getPaddingEndPoints(
    markData.contentVertical,
    markData.repeatVertical
  );
  return [
    vertPadding[0] - 1,
    canvas.width - horiPadding[1] - 1,
    canvas.height - vertPadding[1] - 1,
    horiPadding[0] - 1
  ];
}

const getPaddingEndPoints = function (contentArray, repeatArray) {
  let tempContHori = contentArray.filter(c => !!c.repeat);
  if (!tempContHori.length) {
    tempContHori = repeatArray.filter(r => !!r.repeat);
  }
  return tempContHori.reduce(
    (p, c) => {
      if (p[0] > c.start) {
        p[0] = c.start;
      }
      if (p[1] < c.end) {
        p[1] = c.end;
      }
      return p;
    },
    [Number.MAX_SAFE_INTEGER, 0]
  );
}

const calcStaticWidth = function (array) {
  return array
    .filter(t => !t.repeat)
    .reduce((p, c) => {
      return p + (c.end - c.start);
    }, 0);
}

export const getScaleFactor = function (markData, canvas, selfWidth, selfHeight) {
  const staticWidth = calcStaticWidth(markData.repeatHorizontal);
  const staticHeight = calcStaticWidth(markData.repeatVertical);

  const repeatWidth = canvas.width - staticWidth - 2;
  const repeatHeight = canvas.height - staticHeight - 2;

  const remainWidth = selfWidth - Math.floor(staticWidth);
  const remainHeight = selfHeight - Math.floor(staticHeight);

  return [remainWidth / repeatWidth, remainHeight / repeatHeight];
}

export const drawBackground = function (markData, context, canvas, bg, widthFactor, heightFactor) {
  let pointX = 0, pointY = 0;
  markData.repeatHorizontal.forEach(hori => {
    pointY = 0;
    const originWidth = hori.end - hori.start;
    markData.repeatVertical.forEach(vert => {
      const originHeight = vert.end - vert.start;
      if (hori.repeat) {
        if (vert.repeat) {
          // scale both direction
          drawPiece(context, widthFactor, heightFactor, canvas, hori.start, vert.start, originWidth,
            originHeight, pointX, pointY);
          pointY += originHeight * heightFactor;
        } else {
          // scale horizontal
          drawPiece(context, widthFactor, 0, canvas, hori.start, vert.start,
            originWidth, originHeight, pointX, pointY);
          pointY += Math.floor(originHeight);
        }
      } else {
        if (vert.repeat) {
          // scale vertical
          drawPiece(context, 0, heightFactor, canvas, hori.start, vert.start,
            originWidth, originHeight, pointX, pointY);
          pointY += originHeight * heightFactor;
        } else {
          drawPiece(context, 0, 0, canvas, hori.start, vert.start,
            originWidth, originHeight, pointX, pointY);
          pointY += Math.floor(originHeight);
        }
      }
    });
    if (hori.repeat) {
      pointX += originWidth * widthFactor;
    } else {
      pointX += Math.floor(originWidth);
    }
  });
  return bg.toDataURL();
}


export const throttle = function (fn, delay = 100) {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
      timer = null;
    }, delay);
  }
}