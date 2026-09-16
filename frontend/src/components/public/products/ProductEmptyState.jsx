import { Package } from "lucide-react";



const ProductEmptyState = ({ title, description, actionLabel, onClear }) => (

    <div className="rounded-[22px] bg-theme-surface-soft px-6 py-16 text-center sm:px-10">

        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-theme-surface-soft text-brand-green">

            <Package size={26} aria-hidden="true" />

        </div>

        <h2 className="mt-5 text-xl font-extrabold text-content">{title}</h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-content-secondary">

            {description}

        </p>

        {onClear && actionLabel ? (

            <button

                type="button"

                onClick={onClear}

                className="btn-primary mt-6 min-h-11 px-5 text-sm"

            >

                {actionLabel}

            </button>

        ) : null}

    </div>

);



export default ProductEmptyState;

