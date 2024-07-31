import { CheckCircledIcon } from "@radix-ui/react-icons"

interface FormSuccessProps {
  message?: string;
}

export const FormSuccess = ({message}: FormSuccessProps) => {
  
  if(!message) return null
  
  return (
    <div className="bg-emerald-500/15 p-3 rounded-md text-emerald-500 flex items-center gap-x-2">
      <CheckCircledIcon className="h-4 w-4" />
      {message}
    </div>
  )
}