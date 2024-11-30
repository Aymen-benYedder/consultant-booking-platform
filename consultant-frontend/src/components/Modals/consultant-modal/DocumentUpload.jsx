import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const DocumentUpload = ({ documents, onDocumentsChange, uploadedFiles, setUploadedFiles }) => {
  const handleDocumentChange = async (index, event) => {
    try {
      console.log('Document change event:', event);
      const file = event.target.files[0];
      if (!file) {
        console.log('No file selected');
        return;
      }

      console.log('Selected file:', file);
      const newDocuments = [...documents];
      newDocuments[index] = file.name;
      onDocumentsChange(newDocuments);

      const newUploadedFiles = [...uploadedFiles];
      newUploadedFiles[index] = file;
      setUploadedFiles(newUploadedFiles);

      console.log('Updated documents:', newDocuments);
      console.log('Updated uploaded files:', newUploadedFiles);
    } catch (error) {
      console.error('Error handling document change:', error);
    }
  };

  const handleAddDocument = () => {
    try {
      const newDocuments = [...documents];
      const newUploadedFiles = [...uploadedFiles];
      
      // Only add a new slot if there are no empty slots
      if (!newDocuments.includes('')) {
        newDocuments.push('');
        newUploadedFiles.push(null);
        
        onDocumentsChange(newDocuments);
        setUploadedFiles(newUploadedFiles);
      }
      
      console.log('Added new document slot');
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const handleRemoveDocument = (index) => {
    try {
      const newDocuments = [...documents];
      newDocuments.splice(index, 1);
      onDocumentsChange(newDocuments);

      const newUploadedFiles = [...uploadedFiles];
      newUploadedFiles.splice(index, 1);
      setUploadedFiles(newUploadedFiles);

      console.log('Removed document at index:', index);
    } catch (error) {
      console.error('Error removing document:', error);
    }
  };

  return (
    <div className="mb-4">
      <Disclosure defaultOpen>
        <Disclosure.Button 
          className="flex w-full justify-between rounded-lg bg-sky-100 px-4 py-2 text-left text-sm font-medium text-sky-900 hover:bg-sky-200 focus:outline-none focus-visible:ring focus-visible:ring-sky-500 focus-visible:ring-opacity-75"
        >
          <span>Upload Documents</span>
          <ChevronUpIcon className="h-5 w-5 text-sky-500 transition-transform ui-open:rotate-180" />
        </Disclosure.Button>
        <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Documents</h3>
              <button
                onClick={handleAddDocument}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="file"
                    onChange={(e) => handleDocumentChange(index, e)}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-sky-600 file:text-white
                      hover:file:bg-sky-700
                      file:cursor-pointer cursor-pointer
                      focus:outline-none"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <button
                    onClick={() => handleRemoveDocument(index)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                    title="Remove document"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-gray-500 text-center py-2">
                  No documents added. Click "Add" to upload a document.
                </p>
              )}
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  );
};

export default DocumentUpload;
