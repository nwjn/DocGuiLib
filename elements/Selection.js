import { Animations, CenterConstraint, ConstantColorConstraint, UIRoundedRectangle, UIText, UIWrappedText, animate } from "../../Elementa"
import ElementUtils from "../core/Element"
import BaseElement from "./Base"

export default class SelectionElement extends BaseElement {
    /**
     * - Makes a component that has multiple values to select from with left and right arrows
     * @param {[Any, Any, Any]} selections The values to select from in an array form
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     */
    constructor(selections = [], defaultValue = 0, x, y, width, height) {
        super(x, y, width, height, null, null, "Selection")

        this.selections = selections
        this.maxLength = (this.selections.length - 1)
        this.defaultValue = defaultValue
        this.value = ElementUtils.miniMax(0, this.maxLength, defaultValue)
    }

    /**
     * - Sets the [value] variable to the current index while also checking if
     * it goes off bound in min or max and fixes it if it does
     * @param {*} component 
     * @param {Number} index 
     */
    _setText(component, index) {
        if (index < 0) index = 0
        if (index > this.maxLength) index = this.maxLength

        component.setText(this.selections[index])
        this.value = index
        this._hideArrows(index)
    }

    /**
     * - Hides/Unhides the arrows depending on the current index
     * @param {Number} index 
     * @returns 
     */
    _hideArrows(index) {
        if (this._triggerEvent(this.onMouseClick, index) === 1) return
        
        if (index === 0) {
            this.leftArrow.hide()
            this.rightArrow.unhide(true)

            return
        }
        else if (index === this.maxLength) {
            this.rightArrow.hide()
            this.leftArrow.unhide(true)

            return
        }

        this.leftArrow.unhide(true)
        this.rightArrow.unhide(true)
    }

    /**
     * - Makes a selection like component and returns
     * @param {Object} colorScheme 
     * @returns {SelectionElement}
     */
    _create(colorScheme = {}) {
        if (!this.colorScheme) this.setColorScheme(colorScheme)

        // If default value is under/over the min/max length of the array
        // call [onMouseClick] event with the correct fixed values
        if (this.defaultValue < 0 || this.defaultValue > this.maxLength) {
            this._triggerEvent(this.onMouseClick, this.value)
        }

        this.box = new UIRoundedRectangle(3)
            .setX(this.x)
            .setY(this.y)
            .setWidth(this.width)
            .setHeight(this.height)
            .setColor(this._getColor("backgroundBar"))

        this.textValue = new UIWrappedText(this.selections[this.getValue()], true, null, true, true, 10, "...")
            .setX((1).pixels())
            .setY((new CenterConstraint()))
            .setWidth(this.width)
            .setTextScale((this._getSchemeValue("textScale").pixels()))
            .setColor(this._getColor("textColor"))
            .setChildOf(this.box)

        this.leftArrow = new UIText(this._getSchemeValue("leftArrow"))
            .setX((1).pixels())
            .setY(new CenterConstraint())
            .setTextScale((this._getSchemeValue("textScale").pixels()))
            .setColor(this._getColor("textColor"))
            .setChildOf(this.box)

        this.rightArrow = new UIText(this._getSchemeValue("rightArrow"))
            .setX((1).pixels(true))
            .setY(new CenterConstraint())
            .setTextScale((this._getSchemeValue("textScale").pixels()))
            .setColor(this._getColor("textColor"))
            .setChildOf(this.box)

        // Event handlers
        this.leftArrow
            .onMouseClick((comp, event) => {
                if (this._triggerEvent(this.onMouseClick, comp, event) === 1) return

                this.value--
                this._setText(this.textValue, this.value)
            })
            .onMouseEnter((comp, event) => {
                if (this._triggerEvent(this.onMouseEnter, comp, event) === 1) return
            
                animate(comp, (animation) => {
                    animation.setColorAnimation(
                        Animations[this._getSchemeValue("arrowClickAnimation")],
                        this._getSchemeValue("animationTime"),
                        new ConstantColorConstraint(this._getColor("mouseEnter")),
                        0
                        )
                })
            })
            .onMouseLeave((comp, event) => {
                if (this._triggerEvent(this.onMouseLeave, comp, event) === 1) return
            
                animate(comp, (animation) => {
                    animation.setColorAnimation(
                        Animations[this._getSchemeValue("arrowClickAnimation")],
                        this._getSchemeValue("animationTime"),
                        new ConstantColorConstraint(this._getColor("mouseLeave")),
                        0
                        )
                })
            })

        this.rightArrow
            .onMouseClick((comp, event) => {
                if (this._triggerEvent(this.onMouseClick, comp, event) === 1) return

                this.value++
                this._setText(this.textValue, this.value)
            })
            .onMouseEnter((comp, event) => {
                if (this._triggerEvent(this.onMouseEnter, comp, event) === 1) return
            
                animate(comp, (animation) => {
                    animation.setColorAnimation(
                        Animations[this._getSchemeValue("arrowClickAnimation")],
                        this._getSchemeValue("animationTime"),
                        new ConstantColorConstraint(this._getColor("mouseEnter")),
                        0
                        )
                })
            })
            .onMouseLeave((comp, event) => {
                if (this._triggerEvent(this.onMouseLeave, comp, event) === 1) return
            
                animate(comp, (animation) => {
                    animation.setColorAnimation(
                        Animations[this._getSchemeValue("arrowClickAnimation")],
                        this._getSchemeValue("animationTime"),
                        new ConstantColorConstraint(this._getColor("mouseLeave")),
                        0
                        )
                })
            })

        this._hideArrows(this.getValue())

        return this.box
    }
}