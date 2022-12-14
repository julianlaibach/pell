const defaultParagraphSeparatorString = 'defaultParagraphSeparator'
const formatBlock = 'formatBlock'

const addEventListener = (parent, type, listener) => parent.addEventListener(type, listener)
const appendChild = (parent, child) => parent.appendChild(child)
const createElement = tag => document.createElement(tag)
const queryCommandState = command => document.queryCommandState(command)
const queryCommandValue = command => document.queryCommandValue(command)

export const exec = (command, value = null) => document.execCommand(command, false, value)

const showColorSelector = (event, position) => {
	let editor = event.target.closest('.pell') 
	let popup = editor.getElementsByClassName('pell-popup')[0]
	popup.style.display = "flex"
}

const hideColorSelector = (event, position) => {
	let editor = event.target.closest('.pell') 
	let popup = editor.getElementsByClassName('pell-popup')[0]
	popup.style.display = "none"
}

const defaultActions = {
	foreColor: {
		icon: '<b style="border: 1px solid; background: pink; padding: 2px 5px">A</b>',
		title: 'Bold',
		result: () => showColorSelector(event, 'backColor')
	},
	backColor: {
		icon: '<b style="border: 1px solid; color: pink; padding: 2px 5px">A</b>',
		title: 'Bold',
		result: () => showColorSelector(event, 'foreColor')
	},
	bold: {
		icon: '<b>B</b>',
		title: 'Bold',
		state: () => queryCommandState('bold'),
		result: () => exec('bold')
	},
	italic: {
		icon: '<i>I</i>',
		title: 'Italic',
		state: () => queryCommandState('italic'),
		result: () => exec('italic')
	},
	underline: {
		icon: '<u>U</u>',
		title: 'Underline',
		state: () => queryCommandState('underline'),
		result: () => exec('underline')
	},
	strikethrough: {
		icon: '<strike>S</strike>',
		title: 'Strike-through',
		state: () => queryCommandState('strikeThrough'),
		result: () => exec('strikeThrough')
	},
	heading1: {
		icon: '<b>H<sub>1</sub></b>',
		title: 'Heading 1',
		result: () => exec(formatBlock, '<h1>')
	},
	heading2: {
		icon: '<b>H<sub>2</sub></b>',
		title: 'Heading 2',
		result: () => exec(formatBlock, '<h2>')
	},
	paragraph: {
		icon: '&#182;',
		title: 'Paragraph',
		result: () => exec(formatBlock, '<p>')
	},
	quote: {
		icon: '&#8220; &#8221;',
		title: 'Quote',
		result: () => exec(formatBlock, '<blockquote>')
	},
	olist: {
		icon: '&#35;',
		title: 'Ordered List',
		result: () => exec('insertOrderedList')
	},
	ulist: {
		icon: '&#8226;',
		title: 'Unordered List',
		result: () => exec('insertUnorderedList')
	},
	code: {
		icon: '&lt;/&gt;',
		title: 'Code',
		result: () => exec(formatBlock, '<pre>')
	},
	line: {
		icon: '&#8213;',
		title: 'Horizontal Line',
		result: () => exec('insertHorizontalRule')
	},
	link: {
		icon: '&#128279;',
		title: 'Link',
		result: () => {
			const url = window.prompt('Enter the link URL')
			if (url) exec('createLink', url)
		}
	},
	image: {
		icon: '&#128247;',
		title: 'Image',
		result: () => {
			const url = window.prompt('Enter the image URL')
			if (url) exec('insertImage', url)
		}
	}
}

const defaultClasses = {
	actionbar: 'pell-actionbar',
	button: 'pell-button',
	content: 'pell-content',
	popup: 'pell-popup',
	popup_inner: 'pell-popup-inner',
	popup_title: 'pell-popup-title',
	popup_header: 'pell-popup-header',
	popup_content: 'pell-popup-content',
	selected: 'pell-button-selected',
}

const createColorPopup = (classes, settings) => {
	const hideColorSelector = (event, position) => {
		let editor = event.target.closest('.pell') 
		let popup = editor.getElementsByClassName('pell-popup')[0]
		popup.style.display = "none"
	}

	// create popup
	const popup = createElement('div')
	const popup_inner = createElement('div')
	const popup_header = createElement('div')
	const popup_close = createElement('button')
	const popup_title = createElement('div')
	const popup_content = createElement('div')
	popup.className = classes.popup
	popup_inner.className = classes.popup_inner
	popup_header.className = classes.popup_header
	popup_content.className = classes.popup_content

	popup_title.innerHTML = "Farbauswahl"
	
	appendChild(settings.element, popup)
	appendChild(popup, popup_inner)
	appendChild(popup_inner, popup_header)
	appendChild(popup_header, popup_title)
	appendChild(popup_header, popup_close)
	appendChild(popup_inner, popup_content)

	let colors = [
		'#f4f4f4',
		'#f6f6f6',
		'#999999',
	];

	colors.forEach( (color) => {
		const button = createElement('button')
		button.className = "popup-color-button"
		button.style.background = color
		appendChild(popup_content, button)
		addEventListener(button, 'click', (event) => {
			exec('styleWithCSS', true)
			exec('foreColor', color)
			hideColorSelector(event)
			console.log(color)
		})
	})

	popup_close.innerHTML="x"

	popup_close.addEventListener('click', function(event){
		hideColorSelector(event)
	})
}

export const init = settings => {
	const actions = settings.actions
	? (
		settings.actions.map(action => {
			if (typeof action === 'string') return defaultActions[action]
			else if (defaultActions[action.name]) return { ...defaultActions[action.name], ...action }
			return action
		})
	)
	: Object.keys(defaultActions).map(action => defaultActions[action])

	const classes = { ...defaultClasses, ...settings.classes }

	const defaultParagraphSeparator = settings[defaultParagraphSeparatorString] || 'div'

	// create actiobar
	const actionbar = createElement('div')
	actionbar.className = classes.actionbar
	appendChild(settings.element, actionbar)
	
	// create content
	const content = settings.element.content = createElement('div')
	content.contentEditable = true
	content.className = classes.content
	content.oninput = ({ target: { firstChild } }) => {
		if (firstChild && firstChild.nodeType === 3) exec(formatBlock, `<${defaultParagraphSeparator}>`)
		else if (content.innerHTML === '<br>') content.innerHTML = ''
		settings.onChange(content.innerHTML)
	}

	content.onkeydown = event => {
		if (event.key === 'Enter' && queryCommandValue(formatBlock) === 'blockquote') {
			setTimeout(() => exec(formatBlock, `<${defaultParagraphSeparator}>`), 0)
		}
	}
	appendChild(settings.element, content)

	// initiallize custom actions
	actions.forEach(action => {
		const button = createElement('button')
		button.className = classes.button
		button.innerHTML = action.icon
		button.title = action.title
		button.setAttribute('type', 'button')
		button.onclick = () => action.result() && content.focus() && console.log("click")

		if (action.state) {
			const handler = () => button.classList[action.state() ? 'add' : 'remove'](classes.selected)
			addEventListener(content, 'keyup', handler)
			addEventListener(content, 'mouseup', handler)
			addEventListener(button, 'click', handler)
		}

		appendChild(actionbar, button)
	})

	if (settings.styleWithCSS) {
		exec('styleWithCSS')
		exec(defaultParagraphSeparatorString, defaultParagraphSeparator)
	}

	createColorPopup(classes, settings)

	return settings.element
}

export default { exec, init }
