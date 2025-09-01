import { Animations, AspectConstraint, CenterConstraint, ConstantColorConstraint, OutlineEffect, RelativeConstraint, UIRoundedRectangle, UIText, animate } from "../../Elementa"
import ElementUtils from "../core/Element"
import BaseElement from "./Base"

export default class SliderElement extends BaseElement {
    /**
     * @param {[Number, Number, Number]} settings [Min, Max, Starting Value]
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width The width in pixels
     * @param {Number} height 
     */
    constructor(settings = [ 0, 10 ], defaultValue = 1, x, y, width, height, outline = false) {
        super(x, y, width, height, settings, null, "Slider", outline)

        this.min = settings[0]
        this.max = settings[1]
        this.diff = this.max - this.min

        this.settings = settings.slice()
        this.defaultValue = ElementUtils.miniMax(this.min, this.max, defaultValue)

        // Used to check whether the previously saved value was over/under the min/max
        this.outOfBounds = defaultValue !== this.defaultValue

        const side = 0.31
        this.initialPercent = ElementUtils.miniMax(0, 1, (this.defaultValue - this.min) / this.diff)
        this.initialX = ElementUtils.miniMax(0, 1 - side, this.initialPercent - side / 2)

        // Check for decimal pointers and if they should be there add them
        this.isDecimalSlider = this.min % 1 || this.max % 1 || this.defaultValue % 1
        this.isDragging = false
    }

    _create(colorScheme = {}) {
        if (!this.colorScheme) this.setColorScheme(colorScheme)

        // If the previously saved default value was under/over the min/max
        // we call the [onMouseRelease] event so it gets adjusted to the new value
        if (this.outOfBounds) 
            this._triggerEvent(this.onMouseRelease, this.defaultValue)

        this.backgroundBox = new UIRoundedRectangle(this._getSchemeValue("background", "roundness"))
            .setX(this.x)
            .setY(this.y)
            .setWidth(this.width)
            .setHeight(this.height)
            .setColor(this._getColor("background", "color"))
            .enableEffect(new OutlineEffect(this._getColor("background", "outlineColor"), this._getSchemeValue("background", "outlineSize")))

        this.sliderBar = new UIRoundedRectangle(this._getSchemeValue("bar", "roundness"))
            .setX((1).pixels())
            .setY(new CenterConstraint())
            .setWidth((98).percent())
            .setHeight((10).pixels())
            .setColor(this._getColor("bar", "color"))
            .enableEffect(new OutlineEffect(this._getColor("bar", "outlineColor"), this._getSchemeValue("bar", "outlineSize")))
            .setChildOf(this.backgroundBox)

        this.compBox = new UIRoundedRectangle(this._getSchemeValue("completionbar", "roundness"))
            .setWidth(new RelativeConstraint(this.initialPercent))
            .setHeight((100).percent())
            .setColor(this._getColor("completionbar", "color"))
            .enableEffect(new OutlineEffect(this._getColor("completionbar", "outlineColor"), this._getSchemeValue("completionbar", "outlineSize")))
            .setChildOf(this.sliderBar)
        
        this.sliderBox = new UIRoundedRectangle(this._getSchemeValue("sliderbox", "roundness"))
            .setX(new RelativeConstraint(this.initialX))
            .setY(new CenterConstraint())
            .setWidth(new AspectConstraint(1))
            .setHeight((15).pixels())
            .setColor(this._getColor("sliderbox", "color"))
            .enableEffect(new OutlineEffect(this._getColor("sliderbox", "outlineColor"), this._getSchemeValue("sliderbox", "outlineSize")))
            .setChildOf(this.sliderBar)
        
        this.sliderValue = new UIText(this.defaultValue)
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setTextScale((this._getSchemeValue("text", "scale").pixels()))
            .setColor(this._getColor("text", "color"))
            .setChildOf(this.sliderBox)

        // Slider events
        // Taking the same approach as [https://github.com/EssentialGG/Vigilance/blob/master/src/main/kotlin/gg/essential/vigilance/gui/settings/Slider.kt]
        // since the slider was flickering a lot with the previous code
        this.sliderBar
            .onMouseClick(this._onMouseClick.bind(this))
            .onMouseRelease(this._onMouseRelease.bind(this))
            .onMouseDrag(this._onMouseDrag.bind(this))

        this.backgroundBox
            .onMouseClick(this._onMouseClick.bind(this))
            .onMouseRelease(this._onMouseRelease.bind(this))
            .onMouseDrag(this._onMouseDrag.bind(this))

        this.sliderBox
            .onMouseEnter((comp) => {
                animate(comp, (animation) => {
                    animation.setColorAnimation(
                        Animations[this._getSchemeValue("mouseEnterAnimation", "type")],
                        this._getSchemeValue("mouseEnterAnimation", "time"),
                        new ConstantColorConstraint(this._getColor("mouseEnterAnimation", "color")),
                        0
                        )
                })
            })
            .onMouseLeave((comp) => {
                animate(comp, (animation) => {
                    animation.setColorAnimation(
                        Animations[this._getSchemeValue("mouseLeaveAnimation", "type")],
                        this._getSchemeValue("mouseLeaveAnimation", "time"),
                        new ConstantColorConstraint(this._getColor("mouseLeaveAnimation", "color")),
                        0
                        )
                })
            })

        return this.backgroundBox
    }

    _onMouseClick(component, event) {
        if (this._triggerEvent(this.onMouseClick, component, event) !== 1) 
            this.isDragging = true
    }

    _onMouseRelease() {
        if (this._triggerEvent(this.onMouseRelease, this.getValue()) !== 1)
            this.isDragging = false
    }

    _onMouseDrag(component, x, y, button) {
        if (!this.isDragging) return

        // Cancel the custom event for this component
        if (this._triggerEvent(this.onMouseDrag, x, y, button, component, this.getValue()) === 1) return

        const barLeft = this.sliderBar.getLeft()
        const barRight = this.sliderBar.getRight()
        const barWidth = this.sliderBar.getWidth()

        const clamp = ~~Client.getMouseX() - 1
        const roundNumber = ElementUtils.miniMax(barLeft, barRight, clamp)
        const percent = ElementUtils.miniMax(0, 1, (roundNumber - barLeft) / barWidth)

        // Fix [sliderBox] going off bound
        const sliderBoxHalfWidth = this.sliderBox.getWidth() / 2
        const roundNumberBox = ElementUtils.miniMax(barLeft + sliderBoxHalfWidth, barRight - sliderBoxHalfWidth, clamp)
        const sliderBoxPercent = ElementUtils.miniMax(0, 1, (roundNumberBox - sliderBoxHalfWidth - barLeft) / barWidth)
        
        // Lerp the bounds and percentage to get the value
        const value = this.diff * percent + this.min

        // Makes the rounded number into an actual slider value
        this.value = this.isDecimalSlider ? parseFloat(value.toFixed(2)) : parseInt(value)

        this.sliderValue.setText(this.value)
        this.sliderBox.setX(new RelativeConstraint(sliderBoxPercent))
        this.compBox.setWidth(new RelativeConstraint(percent))
    }

    setValue(value) {
        if (isNaN(value)) value = this.min
        if (value < this.min || value > this.max) value = this.min
        this.value = value

        const side = this.sliderBox.getWidth() / this.sliderBar.getWidth()
        const percent = (value - this.min) / this.diff
        const x = ElementUtils.miniMax(0, 1 - side, percent - side / 2)

        this.sliderBox.setX(new RelativeConstraint(x))
        this.sliderValue.setText(value)
        this.compBox.setWidth(new RelativeConstraint(ElementUtils.miniMax(0, 1, percent)))

        return this.value
    }
}
