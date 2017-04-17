var ARRAY_ELEMENT_FILTER_PREDICATE_KEYWORD = "__arrayElementFilterPredicate__";
var IS_MANDATORY_FIELD_NAME_KEYWORD = "__isMandatory__";

function _cloneNonArrayObject(objectToClone, cloneStructureDefinition) {
    var clonedObject = {};

    for (var fieldNameToKeep in cloneStructureDefinition) {
        if (!cloneStructureDefinition.hasOwnProperty(fieldNameToKeep) || fieldNameToKeep == ARRAY_ELEMENT_FILTER_PREDICATE_KEYWORD || fieldNameToKeep == IS_MANDATORY_FIELD_NAME_KEYWORD) {
            continue;
        }

        var subStructureDefinition = cloneStructureDefinition[fieldNameToKeep];

        var isFieldMandatory = true;
        if (subStructureDefinition && subStructureDefinition[IS_MANDATORY_FIELD_NAME_KEYWORD] == false) {
            isFieldMandatory = false;
        }

        if (!(fieldNameToKeep in objectToClone)) {
            if (isFieldMandatory) {
                throw new Error("Object cloner mandatory field name \"" + fieldNameToKeep + "\" not found");
            }
            continue;
        }

        var objectToCloneFieldValue = objectToClone[fieldNameToKeep];

        if (!(objectToCloneFieldValue instanceof Array) && !(objectToCloneFieldValue instanceof Object)) {
            clonedObject[fieldNameToKeep] = objectToCloneFieldValue;
        } else {
            clonedObject[fieldNameToKeep] = clone(objectToCloneFieldValue, subStructureDefinition);
        }
    }

    return clonedObject;
}

function _cloneArray(arrayToClone, cloneStructureDefinition) {
    var clonedArray = [];

    for (var i = 0; i < arrayToClone.length; i++) {
        var subObject = arrayToClone[i];
        var takeObject = true;
        var filterPredicateFunction = cloneStructureDefinition[ARRAY_ELEMENT_FILTER_PREDICATE_KEYWORD];
        if (filterPredicateFunction) {
            takeObject = filterPredicateFunction(subObject);
        }
        if (takeObject) {
            clonedArray.push(clone(subObject, cloneStructureDefinition));
        }
    }

    return clonedArray;
}

function clone(objectToClone, cloneStructureDefinition) {
    if (objectToClone instanceof Array) {
        return _cloneArray(objectToClone, cloneStructureDefinition);
    } else if (objectToClone instanceof Object) {
        return _cloneNonArrayObject(objectToClone, cloneStructureDefinition);
    } else {
        return objectToClone;
    }
}

exports.clone = clone;