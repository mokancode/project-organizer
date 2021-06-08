const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
    let errors = {};

    data.username = !isEmpty(data.username) ? data.username : '';
    // data.displayName = !isEmpty(data.displayName) ? data.displayName : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    if (Validator.isEmpty(data.username)) {
        errors.username = 'Username field is required'
    } else if (!Validator.isLength(data.username, { min: 5, max: 30 })) {
        errors.username = 'Username must be between 5 and 30 characters'
    } else if (!Validator.isAlphanumeric(data.username)) {
        errors.username = 'Username may include letters, digits and the underscore symbol'
    }
    // else if (!data.username.match(new RegExp(/[A-z]{5,30}/ig))) {
    //     errors.username = 'Username must contain at least 5 letters'
    // }


    // if (Validator.isEmpty(data.displayName)) {
    //     errors.displayName = "Display name is required"
    // }
    // else if (!Validator.isAlphanumeric(data.displayName)) {
    //     errors.displayName = 'Display name may include letters, digits and the underscore symbol'
    // }
    var letterCountUsername = 0;
    var digitCountUsername = 0;
    for (var i = 0; i < data.username.length; i++) {
        // console.log
        if (Validator.isAlpha(data.username[i])) letterCountUsername++;
        else if (Validator.isNumeric(data.username[i])) digitCountUsername++;
    }

    // var letterCountDisplayName = 0;
    // var digitCountDisplayName = 0;
    // for (var i = 0; i < data.displayName.length; i++) {
    //     if (Validator.isAlpha(data.displayName[i])) {
    //         console.log(`${data.displayName[i]} is alpha`);
    //         letterCountDisplayName++;
    //     }
    //     else if (Validator.isNumeric(data.displayName[i])) {
    //         console.log(`${data.displayName[i]} is numeric`);
    //         digitCountDisplayName++;
    //     }
    // }

    // console.log("username", data.username);

    if (letterCountUsername < 5) errors.username = 'Username must include at least 5 letters';
    // if (letterCountDisplayName < 5) errors.displayName = 'Display name must include at least 5 letters';


    // if (Validator.isEmpty(data.email) && !data.email.match(/^.+(\.edu)$/)) {
    //     errors.email = 'Email must be an .edu address';
    // } 
    if (Validator.isEmpty(data.email)) {
        errors.email = 'Email field is required'
    } else if (!Validator.isEmail(data.email)) {
        errors.email = 'Email is invalid';
    }


    if (isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }
    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = 'Password must be between 6 and 30 characters, ' +
            'and must include lowercase and uppercase letters, digit(s), and a special character(s)';
    }
    else {
        var whatIsMissingFromPassword = [];
        if (!data.password.match(/[^A-z0-9_]/)) {
            whatIsMissingFromPassword.push("special character");
            // errors.password = "Password must include at least one special character";
        }
        if (!data.password.match(/[0-9]/)) {
            whatIsMissingFromPassword.push("digit");
            // errors.password = "Password must include at least one digit";
        }
        if (!data.password.match(/[A-Z]/)) {
            whatIsMissingFromPassword.push("uppercase letter");
            // errors.password = "Password must include at least one uppercase letter";
        }
        if (!data.password.match(/[a-z]/)) {
            whatIsMissingFromPassword.push("lowercase letter");
            // errors.password = "Password must include at least one lowercase letter";
        }

        if (whatIsMissingFromPassword.length > 0) {
            var whatIsMissingFromPasswordString = "Password must include at least ";
            for (var i = 0; i < whatIsMissingFromPassword.length; i++) {
                whatIsMissingFromPasswordString += `one ${whatIsMissingFromPassword[i]}`;
                if (i !== whatIsMissingFromPassword.length - 1) whatIsMissingFromPasswordString += ", ";
                if (i === whatIsMissingFromPassword.length - 2) whatIsMissingFromPasswordString += "and "
            }

            errors.password = whatIsMissingFromPasswordString;
        }

    }

    if (Validator.isEmpty(data.password2)) {
        errors.password2 = 'Password confirmation field is required';
    } else if (!Validator.equals(data.password, data.password2)) {
        errors.password2 = 'Passwords must match';
    }


    return {
        errors,
        isValid: isEmpty(errors)
    }
}