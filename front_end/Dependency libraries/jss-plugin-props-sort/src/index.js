/**
 * Sort props by length.
 */
export default function jssPropsSort() {
  const sort = (prop0, prop1) => {
    if (prop0.length === prop1.length) {
      return prop0 > prop1 ? 1 : -1
    }
    return prop0.length - prop1.length
  }

  return {
    onProcessStyle(style, rule) {
      if (rule.type !== 'style') return style

      const newStyle = {}
      const props = Object.keys(style).sort(sort)
      for (let i = 0; i < props.length; i++) {
        newStyle[props[i]] = style[props[i]]
      }
      return newStyle
    }
  }
}
