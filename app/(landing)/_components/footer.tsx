const Footer = () => {
  return (
    <footer className="w-full border-t py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 px-6">
      <h1 className="font-semibold text-gray-700">Clyro</h1>
      <p className="mt-2 md:mt-0">
        © {new Date().getFullYear()} Clyro. All rights reserved.
      </p>
      <div className="flex space-x-4 mt-2 md:mt-0">
        <a href="#" className="hover:text-gray-700 transition">Privacy</a>
        <a href="#" className="hover:text-gray-700 transition">Terms</a>
        <a href="#" className="hover:text-gray-700 transition">Contact</a>
      </div>
    </footer>
  )
}

export default Footer;
