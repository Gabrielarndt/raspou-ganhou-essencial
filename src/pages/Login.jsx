@@ .. @@
           {/* Links */}
           <div className="mt-6 text-center space-y-4">
             <Link
               to="/registro"
               className="block text-yellow-400 hover:text-yellow-300 transition-colors"
             >
               Não tem conta? Registre-se aqui
             </Link>
             
             <button className="text-gray-400 hover:text-white text-sm transition-colors">
               Esqueceu sua senha?
             </button>
+            
+            <Link
+              to="/super-admin-login"
+              className="block text-red-400 hover:text-red-300 text-sm transition-colors border-t border-gray-700 pt-4 mt-4"
+            >
+              🔐 Acesso Administrativo
+            </Link>
           </div>
         </div>