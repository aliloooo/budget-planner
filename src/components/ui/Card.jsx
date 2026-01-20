export default function Card({ children, className = '', noPadding = false }) {
    return (
        <div className={`bg-surface rounded-2xl shadow-sm border border-border overflow-hidden ${className}`}>
            <div className={noPadding ? '' : 'p-5 md:p-6'}>
                {children}
            </div>
        </div>
    )
}
