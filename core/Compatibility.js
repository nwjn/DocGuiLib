export const isLegacy = function() {
    const currentModVersion = ChatTriggers.MODVERSION.match(/^((?:\d+\.?){3})/)[1]
    const lastSupportedVersion = "3.0.0"

    const current = currentModVersion.split(".")
    const supported = lastSupportedVersion.split(".")

    for (let i = 0; i < 3; i++) {
        let cur = current[i] | 0
        let sup = supported[i] | 0
        
        if (cur !== sup) 
            return cur < sup
    }

    return false
}()