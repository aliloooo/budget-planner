// Utility function untuk format mata uang Rupiah
export const formatCurrency = (amount) => {
    const number = Number(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};

// Alternative: Format tanpa simbol Rp (hanya angka dengan separator)
export const formatNumber = (amount) => {
    const number = Number(amount) || 0;
    return new Intl.NumberFormat('id-ID').format(number);
};
