export default function TermsModal({ open, onClose }) {
    if (!open) return null;
  
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg- rounded-lg shadow-lg w-full max-w-2xl p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4  hover:text-gray-400"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-semibold mb-4">Términos de uso</h2>
          <p className=" mb-2">
            Al utilizar este sitio, aceptas los términos de uso. Esta información es informativa y está sujeta a cambios.
          </p>
          <p className="">
            No nos hacemos responsables por cambios en actividades, disponibilidad o precios.
          </p>
        </div>
      </div>
    );
  }
  