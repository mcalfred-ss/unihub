interface IconForTypeProps {
  type: string | null
  className?: string
}

export default function IconForType({ type, className = 'h-6 w-6' }: IconForTypeProps) {
  const getIcon = () => {
    switch (type?.toLowerCase()) {
      case 'note':
      case 'notes':
        return '📝'
      case 'question':
      case 'questions':
        return '❓'
      case 'pdf':
      case 'application/pdf':
        return '📄'
      default:
        return '📄'
    }
  }

  return <span className={className}>{getIcon()}</span>
}

