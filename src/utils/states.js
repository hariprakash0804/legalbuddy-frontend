/**
 * Comprehensive list of all 28 States and 8 Union Territories in India
 * along with the national 'All States' scope.
 */

export const INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
];

export const INDIAN_UNION_TERRITORIES = [
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry'
];

// Alphabetically sorted list of all 36 States and UTs
export const SORTED_STATES_AND_UTS = [
    ...INDIAN_STATES,
    ...INDIAN_UNION_TERRITORIES
].sort((a, b) => a.localeCompare(b));

// Default full list with 'All States' (National) option at index 0
export const ALL_INDIAN_STATES_AND_UTS = [
    'All States',
    ...SORTED_STATES_AND_UTS
];

export const isUnionTerritory = (name) => {
    return INDIAN_UNION_TERRITORIES.includes(name);
};
