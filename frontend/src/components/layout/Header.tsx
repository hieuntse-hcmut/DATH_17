// import LanguageSwitcher from '../LanguageSwitcher'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons"

export default function Header() {
    return (
        <header className="flex items-center justify-between h-16 bg-white/90 shadow-(0px 1px 8px rgba(0, 0, 0, 0.04)) px-6">
            {/* Tìm kiếm */}
            <div className="h-7.5 w-md bg-[#F2F3FF] rounded-xl p-[4px_12px]">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="h-3.75 w-3.75 text-[#777587]"/>
                <input placeholder="Tìm kiếm khóa học, tài liệu, lớp học..."/>
            </div>
            {/* <LanguageSwitcher /> */}
        </header>
    )
}