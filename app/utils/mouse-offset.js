export default function mouseOffset(e, t) {
  // !! offset relative to the currentTarget not the target
  let target = t || e.currentTarget || e.srcElement;
  let style = target.currentStyle || window.getComputedStyle(target, null);
  let borderLeftWidth = parseInt(style['borderLeftWidth'], 10);
  let borderTopWidth = parseInt(style['borderTopWidth'], 10);
  let rect = target.getBoundingClientRect();
  return {
    left: e.clientX - borderLeftWidth - rect.left,
    top: e.clientY - borderTopWidth - rect.top
  };
}
