/**
 * Validation utilities for LegalBuddy AI Platform
 */

// RFC 5322 compliant regex for practical email validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates an email address.
 * @param {string} email
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: 'Email address is required.' };
    }

    const trimmed = email.trim();
    if (trimmed.length === 0) {
        return { isValid: false, error: 'Email address cannot be blank.' };
    }

    if (trimmed.length > 120) {
        return { isValid: false, error: 'Email address must not exceed 120 characters.' };
    }

    if (!EMAIL_REGEX.test(trimmed)) {
        return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com).' };
    }

    const parts = trimmed.split('@');
    if (parts.length !== 2 || !parts[1].includes('.')) {
        return { isValid: false, error: 'Email must contain a valid domain (e.g. .com, .org).' };
    }

    const domainParts = parts[1].split('.');
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
        return { isValid: false, error: 'Email top-level domain must be at least 2 characters.' };
    }

    return { isValid: true, error: null };
}

/**
 * Calculates password strength and requirements breakdown.
 * @param {string} password
 * @returns {{
 *   score: number,
 *   label: string,
 *   color: string,
 *   barWidth: string,
 *   requirements: Array<{ key: string, label: string, met: boolean }>
 * }}
 */
export function getPasswordStrength(password) {
    const pwd = String(password || '');
    
    const requirements = [
        {
            key: 'length',
            label: 'At least 8 characters',
            met: pwd.length >= 8,
        },
        {
            key: 'letters',
            label: 'Contains both uppercase & lowercase letters',
            met: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
        },
        {
            key: 'number',
            label: 'Contains at least one number (0-9)',
            met: /[0-9]/.test(pwd),
        },
        {
            key: 'special',
            label: 'Contains a special character (@$!%*?&#)',
            met: /[^A-Za-z0-9]/.test(pwd),
        },
    ];

    const metCount = requirements.filter(r => r.met).length;

    let score = 0;
    let label = 'Enter password';
    let color = '#D7DBE2';
    let barWidth = '0%';

    if (pwd.length === 0) {
        score = 0;
        label = 'Enter password';
        color = '#D7DBE2';
        barWidth = '0%';
    } else if (pwd.length < 8) {
        score = 1;
        label = 'Too short';
        color = '#9C2A22';
        barWidth = '25%';
    } else if (metCount <= 2) {
        score = 2;
        label = 'Weak';
        color = '#966016'; // warning bronze/amber
        barWidth = '50%';
    } else if (metCount === 3) {
        score = 3;
        label = 'Good';
        color = '#12786D'; // teal
        barWidth = '75%';
    } else {
        score = 4;
        label = 'Strong';
        color = '#1F6B45'; // success green
        barWidth = '100%';
    }

    return { score, label, color, barWidth, requirements };
}

/**
 * Validates a password.
 * @param {string} password
 * @param {boolean} isRegistration - If true, enforces stronger registration rules (letters & numbers)
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validatePassword(password, isRegistration = false) {
    if (!password || typeof password !== 'string') {
        return { isValid: false, error: 'Password is required.' };
    }

    if (password.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters long.' };
    }

    if (password.length > 128) {
        return { isValid: false, error: 'Password must not exceed 128 characters.' };
    }

    if (isRegistration) {
        const hasLetter = /[A-Za-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (!hasLetter || !hasNumber) {
            return { isValid: false, error: 'Password must contain both letters and numbers.' };
        }
    }

    return { isValid: true, error: null };
}

/**
 * Validates confirm password matches password.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) {
        return { isValid: false, error: 'Please confirm your password.' };
    }

    if (password !== confirmPassword) {
        return { isValid: false, error: 'Passwords do not match.' };
    }

    return { isValid: true, error: null };
}

/**
 * Validates legal disclaimer / terms acceptance.
 * @param {boolean} accepted
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateTerms(accepted) {
    if (!accepted) {
        return { isValid: false, error: 'You must acknowledge the legal guidance disclaimer to proceed.' };
    }
    return { isValid: true, error: null };
}

/**
 * Validates chat query input.
 * @param {string} query
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateChatQuery(query) {
    if (!query || typeof query !== 'string') {
        return { isValid: false, error: 'Please enter a legal query or question.' };
    }

    const trimmed = query.trim();
    if (trimmed.length === 0) {
        return { isValid: false, error: 'Query cannot be empty or only spaces.' };
    }

    if (trimmed.length < 2) {
        return { isValid: false, error: 'Query is too short. Please provide more context.' };
    }

    if (trimmed.length > 2000) {
        return { isValid: false, error: `Query exceeds maximum length of 2000 characters (${trimmed.length}/2000).` };
    }

    return { isValid: true, error: null };
}
