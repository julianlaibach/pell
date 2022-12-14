(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.pell = {})));
}(this, (function (exports) { 'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var defaultParagraphSeparatorString = 'defaultParagraphSeparator';
var formatBlock = 'formatBlock';

var addEventListener = function addEventListener(parent, type, listener) {
	return parent.addEventListener(type, listener);
};
var appendChild = function appendChild(parent, child) {
	return parent.appendChild(child);
};
var createElement = function createElement(tag) {
	return document.createElement(tag);
};
var queryCommandState = function queryCommandState(command) {
	return document.queryCommandState(command);
};
var queryCommandValue = function queryCommandValue(command) {
	return document.queryCommandValue(command);
};

var exec = function exec(command) {
	var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	return document.execCommand(command, false, value);
};

var showColorSelector = function showColorSelector(event, position) {
	var editor = event.target.closest('.pell');
	var popup = editor.getElementsByClassName('pell-popup')[0];
	popup.style.display = "flex";
};

var defaultActions = {
	foreColor: {
		icon: '<b style="border: 1px solid; background: pink; padding: 2px 5px">A</b>',
		title: 'Bold',
		result: function result() {
			return showColorSelector(event, 'backColor');
		}
	},
	backColor: {
		icon: '<b style="border: 1px solid; color: pink; padding: 2px 5px">A</b>',
		title: 'Bold',
		result: function result() {
			return showColorSelector(event, 'foreColor');
		}
	},
	bold: {
		icon: '<b>B</b>',
		title: 'Bold',
		state: function state() {
			return queryCommandState('bold');
		},
		result: function result() {
			return exec('bold');
		}
	},
	italic: {
		icon: '<i>I</i>',
		title: 'Italic',
		state: function state() {
			return queryCommandState('italic');
		},
		result: function result() {
			return exec('italic');
		}
	},
	underline: {
		icon: '<u>U</u>',
		title: 'Underline',
		state: function state() {
			return queryCommandState('underline');
		},
		result: function result() {
			return exec('underline');
		}
	},
	strikethrough: {
		icon: '<strike>S</strike>',
		title: 'Strike-through',
		state: function state() {
			return queryCommandState('strikeThrough');
		},
		result: function result() {
			return exec('strikeThrough');
		}
	},
	heading1: {
		icon: '<b>H<sub>1</sub></b>',
		title: 'Heading 1',
		result: function result() {
			return exec(formatBlock, '<h1>');
		}
	},
	heading2: {
		icon: '<b>H<sub>2</sub></b>',
		title: 'Heading 2',
		result: function result() {
			return exec(formatBlock, '<h2>');
		}
	},
	paragraph: {
		icon: '&#182;',
		title: 'Paragraph',
		result: function result() {
			return exec(formatBlock, '<p>');
		}
	},
	quote: {
		icon: '&#8220; &#8221;',
		title: 'Quote',
		result: function result() {
			return exec(formatBlock, '<blockquote>');
		}
	},
	olist: {
		icon: '&#35;',
		title: 'Ordered List',
		result: function result() {
			return exec('insertOrderedList');
		}
	},
	ulist: {
		icon: '&#8226;',
		title: 'Unordered List',
		result: function result() {
			return exec('insertUnorderedList');
		}
	},
	code: {
		icon: '&lt;/&gt;',
		title: 'Code',
		result: function result() {
			return exec(formatBlock, '<pre>');
		}
	},
	line: {
		icon: '&#8213;',
		title: 'Horizontal Line',
		result: function result() {
			return exec('insertHorizontalRule');
		}
	},
	link: {
		icon: '&#128279;',
		title: 'Link',
		result: function result() {
			var url = window.prompt('Enter the link URL');
			if (url) exec('createLink', url);
		}
	},
	image: {
		icon: '&#128247;',
		title: 'Image',
		result: function result() {
			var url = window.prompt('Enter the image URL');
			if (url) exec('insertImage', url);
		}
	}
};

var defaultClasses = {
	actionbar: 'pell-actionbar',
	button: 'pell-button',
	content: 'pell-content',
	popup: 'pell-popup',
	popup_inner: 'pell-popup-inner',
	popup_title: 'pell-popup-title',
	popup_header: 'pell-popup-header',
	popup_content: 'pell-popup-content',
	selected: 'pell-button-selected'
};

var createColorPopup = function createColorPopup(classes, settings) {
	var hideColorSelector = function hideColorSelector(event, position) {
		var editor = event.target.closest('.pell');
		var popup = editor.getElementsByClassName('pell-popup')[0];
		popup.style.display = "none";
	};

	// create popup
	var popup = createElement('div');
	var popup_inner = createElement('div');
	var popup_header = createElement('div');
	var popup_close = createElement('button');
	var popup_title = createElement('div');
	var popup_content = createElement('div');
	popup.className = classes.popup;
	popup_inner.className = classes.popup_inner;
	popup_header.className = classes.popup_header;
	popup_content.className = classes.popup_content;

	popup_title.innerHTML = "Farbauswahl";

	appendChild(settings.element, popup);
	appendChild(popup, popup_inner);
	appendChild(popup_inner, popup_header);
	appendChild(popup_header, popup_title);
	appendChild(popup_header, popup_close);
	appendChild(popup_inner, popup_content);

	var colors = ['#f4f4f4', '#f6f6f6', '#999999'];

	colors.forEach(function (color) {
		var button = createElement('button');
		button.className = "popup-color-button";
		button.style.background = color;
		appendChild(popup_content, button);
		addEventListener(button, 'click', function (event) {
			exec('styleWithCSS', true);
			exec('foreColor', color);
			hideColorSelector(event);
			console.log(color);
		});
	});

	popup_close.innerHTML = "x";

	popup_close.addEventListener('click', function (event) {
		hideColorSelector(event);
	});
};

var init = function init(settings) {
	var actions = settings.actions ? settings.actions.map(function (action) {
		if (typeof action === 'string') return defaultActions[action];else if (defaultActions[action.name]) return _extends({}, defaultActions[action.name], action);
		return action;
	}) : Object.keys(defaultActions).map(function (action) {
		return defaultActions[action];
	});

	var classes = _extends({}, defaultClasses, settings.classes);

	var defaultParagraphSeparator = settings[defaultParagraphSeparatorString] || 'div';

	// create actiobar
	var actionbar = createElement('div');
	actionbar.className = classes.actionbar;
	appendChild(settings.element, actionbar);

	// create content
	var content = settings.element.content = createElement('div');
	content.contentEditable = true;
	content.className = classes.content;
	content.oninput = function (_ref) {
		var firstChild = _ref.target.firstChild;

		if (firstChild && firstChild.nodeType === 3) exec(formatBlock, '<' + defaultParagraphSeparator + '>');else if (content.innerHTML === '<br>') content.innerHTML = '';
		settings.onChange(content.innerHTML);
	};

	content.onkeydown = function (event) {
		if (event.key === 'Enter' && queryCommandValue(formatBlock) === 'blockquote') {
			setTimeout(function () {
				return exec(formatBlock, '<' + defaultParagraphSeparator + '>');
			}, 0);
		}
	};
	appendChild(settings.element, content);

	// initiallize custom actions
	actions.forEach(function (action) {
		var button = createElement('button');
		button.className = classes.button;
		button.innerHTML = action.icon;
		button.title = action.title;
		button.setAttribute('type', 'button');
		button.onclick = function () {
			return action.result() && content.focus() && console.log("click");
		};

		if (action.state) {
			var handler = function handler() {
				return button.classList[action.state() ? 'add' : 'remove'](classes.selected);
			};
			addEventListener(content, 'keyup', handler);
			addEventListener(content, 'mouseup', handler);
			addEventListener(button, 'click', handler);
		}

		appendChild(actionbar, button);
	});

	if (settings.styleWithCSS) {
		exec('styleWithCSS');
		exec(defaultParagraphSeparatorString, defaultParagraphSeparator);
	}

	createColorPopup(classes, settings);

	return settings.element;
};

var pell = { exec: exec, init: init };

exports.exec = exec;
exports.init = init;
exports['default'] = pell;

Object.defineProperty(exports, '__esModule', { value: true });

})));
