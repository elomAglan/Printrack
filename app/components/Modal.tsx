// src/app/components/Modal.tsx

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
  }
  
  export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null
  
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{title}</h3>
            <button onClick={onClose} className="text-red-500 hover:text-red-700">
              X
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    )
  }
  