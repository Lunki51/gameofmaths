/**
 * Check if all the property are valid and cast if needed.
 *
 * @param pts jsonObject with type associated to an array on attribute
 * @param value object to format
 * @returns the object formatted, null if the input object is invalid
 */
exports.formatPropertiesWithType = function (pts, value) {
    const nv = value.clone();
    for (pt of pts) {
        if (!pt.hasOwnProperty('ps') || !pt.hasOwnProperty('t')) return null;
        for (p of pt.ps) {
            if (!nv.hasOwnProperty(p)) return null;
            const t = module.exports.castToType(pt.t, nv[p]);
            if (!t) return null;
            nv[p] = t;
        }
    }
    return nv;
};

/**
 * Cast a value to a type.
 *
 * @param type new type (Available type: string (is trim), number, boolean, date)
 * @param value value to cast
 * @returns value casted, null if the cast can't be done.
 */
exports.castToType = function (type, value) {
    switch (type) {
        case 'string':
            return String(value).trim();
        case 'number':
            return Number(value);
        case 'boolean':
            if (value === 'true' || value === '1') return true;
            else if (value === 'false' || value === '0') return false;
            else return null;
        case 'date':
            return new Date(value);
    }
}