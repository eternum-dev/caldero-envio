import HeaderLogo from './HeaderLogo';
import HeaderNav from './HeaderNav';
import HeaderActions from './HeaderActions';
import HeaderUserMenu from './HeaderUserMenu';
import HeaderStepIndicator from './HeaderStepIndicator';
import HeaderToolsMenu from './HeaderToolsMenu';

function Header({ children }) {
  return (
    <header className="bg-surface">
      <div className="max-w-7xl mx-auto px-7 py-3.5 flex justify-between items-center">
        {children}
      </div>
    </header>
  );
}

Header.Logo = HeaderLogo;
Header.Nav = HeaderNav;
Header.Actions = HeaderActions;
Header.UserMenu = HeaderUserMenu;
Header.StepIndicator = HeaderStepIndicator;
Header.ToolsMenu = HeaderToolsMenu;

export default Header;
