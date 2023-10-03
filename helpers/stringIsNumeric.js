// cf. https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
export function stringIsNumeric(input) {
    // we only process strings
    if (typeof input != "string") {
        return false;
    }

    // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    return !isNaN(input)
        // ...and ensure strings of whitespace fail
        && !isNaN(parseFloat(input));

}

export default stringIsNumeric;
