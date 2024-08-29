import { AtInput } from 'taro-ui'
import classNames from 'classnames';
import React from 'react';
import { Input, Label, Text, View } from '@tarojs/components';
import './index.scss'

function getInputProps(props) {
  const actualProps = {
      type: props.type,
      maxLength: props.maxlength,
      disabled: props.disabled,
      password: false
  };
  switch (actualProps.type) {
      case 'phone':
          actualProps.type = 'number';
          actualProps.maxLength = 11;
          break;
      case 'password':
          actualProps.type = 'text';
          actualProps.password = true;
          break;
      default:
          break;
  }
  if (!props.disabled && !props.editable) {
      actualProps.disabled = true;
  }
  return actualProps;
}
class HdInput extends AtInput {
  constructor() {
    super(...arguments)
  }
  render() {
    const { className, customStyle, name, cursorSpacing, confirmType, cursor, selectionStart, selectionEnd, adjustPosition, border, title, error, clear, placeholder, placeholderStyle, placeholderClass, autoFocus, focus, value, required, password } = this.props;
    const { type, maxLength, disabled } = getInputProps(this.props);
    const rootCls = classNames('at-input', {
        'at-input--without-border': !border
    }, className);
    const containerCls = classNames('at-input__container', {
        'at-input--error': error,
        'at-input--disabled': disabled
    });
    const overlayCls = classNames('at-input__overlay', {
        'at-input__overlay--hidden': !disabled
    });
    const placeholderCls = classNames('placeholder', placeholderClass);
    return (React.createElement(View, { className: rootCls, style:  error ? {...customStyle,borderBottom:'1px solid #F7461D'} : customStyle  },
        React.createElement(View, { className: containerCls },
            React.createElement(View, { className: overlayCls, onClick: this.handleClick }),
            title && (React.createElement(Label, { className: `at-input__title ${required && 'at-input__title--required'}`, for: name }, title)),
            React.createElement(Input, { className: 'at-input__input', id: name, name: name, type: type, password: password, placeholderStyle: placeholderStyle, placeholderClass: placeholderCls, placeholder: placeholder, cursorSpacing: cursorSpacing, maxlength: maxLength, autoFocus: autoFocus, focus: focus, value: value, confirmType: confirmType, cursor: cursor, selectionStart: selectionStart, selectionEnd: selectionEnd, adjustPosition: adjustPosition, onInput: this.handleInput, onFocus: this.handleFocus, onBlur: this.handleBlur, onConfirm: this.handleConfirm,
                // @ts-ignore
                onKeyboardHeightChange: this.handleKeyboardHeightChange }),
            clear && value && (React.createElement(View, { className: 'at-input__icon', onTouchEnd: this.handleClearValue },
                React.createElement(Text, { className: 'at-icon at-icon-close' }))),
            React.createElement(View, { className: 'at-input__children' }, this.props.children))));
}
}
export default HdInput
