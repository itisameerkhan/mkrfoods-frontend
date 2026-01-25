import React, { useEffect, useMemo, useState, useRef } from "react";
import './QuantitySelector.scss';

const WEIGHTS = [
    { size: 250, label: "250g" },
    { size: 500, label: "500g" },
    { size: 1000, label: "1kg" },
];

export default function QuantitySelector({
    totalAvailableGrams = 0,
    initialQuantities = {},
    priceMap = {},
    disabled = false,
    onChange,
}) {
    const [quantities, setQuantities] = useState({
        250: initialQuantities[250] || 0,
        500: initialQuantities[500] || 0,
        1000: initialQuantities[1000] || 0,
    });
    const hasInitialized = useRef(false);

    // Only sync initialQuantities once on first mount
    useEffect(() => {
        if (!hasInitialized.current) {
            setQuantities({
                250: initialQuantities[250] || 0,
                500: initialQuantities[500] || 0,
                1000: initialQuantities[1000] || 0,
            });
            hasInitialized.current = true;
        }
    }, []);

    const totalSelectedGrams = useMemo(
        () => WEIGHTS.reduce((s, w) => s + (quantities[w.size] || 0) * w.size, 0),
        [quantities]
    );

    const remainingGrams = Math.max(0, totalAvailableGrams - totalSelectedGrams);

    // compute total price based on priceMap: priceMap keys are weight sizes
    const totalPrice = WEIGHTS.reduce((sum, w) => {
        const unitPrice = Number(priceMap[w.size] || 0);
        return sum + (quantities[w.size] || 0) * unitPrice;
    }, 0);

    // Global + disable rules: disable all + when totalSelected === available
    // But allow unlimited if totalAvailableGrams is 0 or not set
    const anyIncrementWouldExceed = totalAvailableGrams > 0 && WEIGHTS.some((w) => totalSelectedGrams + w.size > totalAvailableGrams);
    const globalPlusDisabled = (totalAvailableGrams > 0 && totalSelectedGrams === totalAvailableGrams) || anyIncrementWouldExceed;

    // Only call onChange when user clicks +/-, not during initialization
    // Prevent calling onChange by not including it in dependencies
    useEffect(() => {
        if (typeof onChange === "function") onChange(quantities, totalSelectedGrams, totalPrice);
    }, [quantities]);

    const increment = (size) => {
        if (disabled) return;
        setQuantities((prev) => {
            const currentTotal = WEIGHTS.reduce((s, w) => s + (prev[w.size] || 0) * w.size, 0);
            const newTotal = currentTotal + size;
            // If no inventory limit set, allow unlimited. Otherwise check against limit
            if (totalAvailableGrams > 0 && newTotal > totalAvailableGrams) return prev;
            return { ...prev, [size]: (prev[size] || 0) + 1 };
        });
    };

    const decrement = (size) => {
        if (disabled) return;
        setQuantities((prev) => ({ ...prev, [size]: Math.max(0, (prev[size] || 0) - 1) }));
    };

    const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);

    return (
        <div className={`qs-container ${disabled ? 'qs-disabled' : ''}`} aria-live="polite">
            <div className="qs-header">
                <div className="qs-header-top">
                    <h3 className="qs-title">Select Size & Quantity</h3>
                    {totalItems > 0 && (
                        <div className="qs-summary-badge">
                            <span className="qs-summary-count">{totalItems} items</span>
                            <span className="qs-summary-sep">•</span>
                            <span className="qs-summary-total">₹{totalPrice.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="qs-grid">
                {WEIGHTS.map((w) => {
                    const qty = quantities[w.size] || 0;
                    const minusDisabled = disabled || qty === 0;
                    const plusDisabled = disabled || globalPlusDisabled;
                    const unitPrice = Number(priceMap[w.size] || 0);
                    const isSelected = qty > 0;

                    return (
                        <div 
                            key={w.size} 
                            className={`qs-card ${isSelected ? 'qs-card-selected' : ''}`}
                        >
                            <div className="qs-card-header">
                                <span className="qs-card-weight">{w.label}</span>
                                <span className="qs-card-price">₹{unitPrice}</span>
                            </div>

                            <div className="qs-card-footer">
                                {qty === 0 ? (
                                    <button
                                        type="button"
                                        className="qs-btn-add"
                                        onClick={() => increment(w.size)}
                                        disabled={disabled || globalPlusDisabled}
                                        aria-label={`Add ${w.label}`}
                                    >
                                        ADD
                                    </button>
                                ) : (
                                    <div className="qs-controls">
                                        <button
                                            type="button"
                                            className="qs-action-btn qs-btn-minus"
                                            onClick={() => decrement(w.size)}
                                            disabled={minusDisabled}
                                            aria-label={`Decrease ${w.label}`}
                                        >
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        
                                        <span className="qs-card-qty">
                                            {qty}
                                        </span>

                                        <button
                                            type="button"
                                            className="qs-action-btn qs-btn-plus"
                                            onClick={() => increment(w.size)}
                                            disabled={plusDisabled}
                                            aria-label={`Increase ${w.label}`}
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

