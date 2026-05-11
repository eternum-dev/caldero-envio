import HeaderLogo from './HeaderLogo';
import HeaderNav from './HeaderNav';
import HeaderActions from './HeaderActions';
import HeaderUserMenu from './HeaderUserMenu';
import HeaderStepIndicator from './HeaderStepIndicator';

function Header({ children }) {
  return (
    <header className="bg-surface-low">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
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

export default Header;