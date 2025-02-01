// // src/components/NetworkGraph/TemplateSelector.tsx
// import { useState } from 'react';
// import styles from './styles.module.css';
// import { roomTemplates } from '@/lib/graph/templates';

// interface TemplateSelectorProps {
//   onSelect: (templateIndex: number) => void;
// }

// export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
//   const [isOpen, setIsOpen] = useState(false);

//   const templates = [
//     { id: 0, name: '1-Bedroom Suite' },
//     { id: 1, name: '2-Bedroom Suite' },
//     { id: 2, name: '3-Bedroom Suite' },
//   ];

//   return (
//     <div className={styles.templateSelector}>
//       <button 
//         onClick={() => setIsOpen(!isOpen)}
//         className={styles.dropdownButton}
//       >
//         Predefined Layouts
//       </button>
//       {isOpen && (
//         <div className={styles.dropdownContent}>
//           {templates.map((template) => (
//             <button
//               key={template.id}
//               onClick={() => {
//                 onSelect(template.id);
//                 setIsOpen(false);
//               }}
//               className={styles.templateOption}
//             >
//               {template.name}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }