import LanguageSwitcher from '../LanguageSwitcher'

export default function Header() {
    return (
        <header className="flex items-center justify-between p-16">
            <h1 className="text-2xl font-bold">Đây là Header</h1>
            <LanguageSwitcher />
        </header>
    )
}