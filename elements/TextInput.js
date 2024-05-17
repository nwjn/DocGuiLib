import { Animations, ConstantColorConstraint, UIRoundedRectangle, UIText, UITextInput, animate } from "../../Elementa"
import BaseElement from "./Base"

export default class TextInputElement extends BaseElement {
    /**
     * @param {String} string The placeholder text
     * @param {Number} x This component's x value (default in percent)
     * @param {Number} y This component's y value (default in percent)
     * @param {Number} width This component's width value in pixels
     * @param {Number} height This component's height value in pixels
     */
    constructor(string = "Placeholder", x = 0, y = 0, width = 150, height = 8) {
        super(x, y, width, height, string, null, "TextInput")

        this.text = null
        this.placeHolder = null
    }

    /**
     * - Sets the placeholder for this textinput
     * @param {String} str 
     * @returns this for method chaining
     */
    setPlaceHolder(str) {
        this.placeHolder = str

        return this
    }

    /**
     * - Gets the current text in this component
     * @returns {String}
     */
    getText() {
        return this.text
    }

    /**
     * - Creates this [TextInputElement] component and returns it
     * @returns {TextInputElement}
     */
    _create(colorScheme = {}, elementType = null) {
        if (!this.colorScheme) this.setColorScheme(colorScheme)
        if (elementType) this.elementType = elementType

        this.bgBox = new UIRoundedRectangle(3)
            .setX(this.x)
            .setY(this.y)
            .setWidth(this.width)
            .setHeight(this.height)
            .setColor(this._getColor("backgroundBox"))

        this.textInput = new UITextInput(this.getValue())
            .setX((3).pixels())
            .setY((1).pixels())
            .setWidth((80).percent())
            .setHeight((80).percent())
            .setTextScale((this._getSchemeValue("textScale")).pixel())
            .setColor(this._getColor("textColor"))
            .setChildOf(this.bgBox)

        if (this.placeHolder) {
            this.placeholderText = new UIText(this.placeHolder)
                .setX((1).pixels())
                .setY((1).pixels())
                .setChildOf(this.textInput)
        }

        this.textInput
            .onFocus(() => this.placeholderText?.hide(true))
            .onFocusLost(() => {
                if (this.text) return

                this.placeholderText?.unhide(true)
            })
            .onMouseClick((component, __) => {
                if (this._triggerEvent(this.onMouseClick, component) === 1) return

                if (!component.getText()) component.setText(this.getValue())
                
                component.grabWindowFocus()
                component.focus()
                if (this.placeholderText) this.placeholderText.hide(true)
            })
            .onMouseEnter((comp, event) => {
                if (this._triggerEvent(this.onMouseEnter, comp, event) === 1) return
            
                animate(comp, (animation) => {
                    animation.setColorAnimation(
                        Animations.OUT_EXP,
                        0.5,
                        new ConstantColorConstraint(this._getColor("mouseEnter")),
                        0
                        )
                })
            })
            .onMouseLeave((comp, event) => {
                if (this._triggerEvent(this.onMouseLeave, comp, event) === 1) return
            
                animate(comp, (animation) => {
                    animation.setColorAnimation(
                        Animations.OUT_EXP,
                        0.5,
                        new ConstantColorConstraint(this._getColor("mouseLeave")),
                        0
                        )
                })
            })
            .onKeyType((input, char, keycode) => {
                if (this._triggerEvent(this.onKeyType, input.getText(), char, keycode) === 1) return

                this.text = input.getText()
                
                if (this.placeholderText && input.getText() == "") return this.placeholderText.unhide(true)
                if (this.placeholderText) this.placeholderText.hide(true)
            })

        if (this.placeholderText) {
            this.placeholderText
                .onMouseEnter((comp, event) => {
                    if (this._triggerEvent(this.onMouseEnter, comp, event) === 1) return
                
                    animate(comp, (animation) => {
                        animation.setColorAnimation(
                            Animations.OUT_EXP,
                            0.5,
                            new ConstantColorConstraint(this._getColor("mouseEnter")),
                            0
                            )
                    })
                })
                .onMouseLeave((comp, event) => {
                    if (this._triggerEvent(this.onMouseLeave, comp, event) === 1) return
                
                    animate(comp, (animation) => {
                        animation.setColorAnimation(
                            Animations.OUT_EXP,
                            0.5,
                            new ConstantColorConstraint(this._getColor("mouseLeave")),
                            0
                            )
                    })
                })
        }

        return this.bgBox
    }
}