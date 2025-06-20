
import React, { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  title?: string; // Optional: can be used for document title or a heading within the page
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, title }) => {
  // useEffect(() => {
  //   if (title) {
  //     document.title = `${title} | ${APP_NAME}`;
  //   } else {
  //     document.title = APP_NAME;
  //   }
  // }, [title]);
  // Document title update might conflict with iframe host. Handle this carefully if needed.

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {children}
    </div>
  );
};
