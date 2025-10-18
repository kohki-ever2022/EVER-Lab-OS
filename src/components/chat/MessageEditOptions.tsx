import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface MessageEditOptionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const MessageEditOptions: React.FC<MessageEditOptionsProps> = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    // A simple confirmation dialog before proceeding with deletion
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete();
    }
    setIsOpen(false);
  };

  const handleEdit = () => {
    onEdit();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Close on blur with a delay
        className="p-1 rounded-full hover:bg-gray-200/50 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1 w-28 bg-white border rounded-lg shadow-lg z-20">
          <ul>
            <li>
              <button
                onClick={handleEdit}
                className="w-full flex items-center px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </button>
            </li>
            <li>
              <button
                onClick={handleDelete}
                className="w-full flex items-center px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};