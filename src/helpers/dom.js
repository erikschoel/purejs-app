export function getPosition(el) {
  let xPos = 0;
  let yPos = 0;

  let xScroll;
  let yScroll;

  while (el) {
    if (el.tagName === 'BODY') {
      // deal with browser quirks with body/window/document and page scroll
      xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }

    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos
  };
}

export function getTransformPosition(el) {
  const t = el.style.transform || '';
  return (t ? t.split('(').pop().split(',').slice(0, -1).map(x => x.replace(/[^0-9]/g, '')).map(x => parseInt(x)) : [ 0, 0 ]).reduce((acc, value, index) => {
    acc[(index === 0 ? 'x' : 'y')] = value;
    return acc;
  }, {});
}
