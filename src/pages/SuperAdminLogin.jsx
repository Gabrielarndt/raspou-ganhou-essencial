@@ .. @@
    try {
      // Verificar se é super admin
      const superAdmins = JSON.parse(localStorage.getItem('raspou_super_admins') || '[]');
      const admins = JSON.parse(localStorage.getItem('raspou_admins') || '[]');
      
      const foundSuperAdmin = superAdmins.find(sa => 
        sa.email === formData.email && 
        (sa.password === formData.senha)
      );

      const foundAdmin = admins.find(a => 
        a.email === formData.email && 
        (a.password === formData.senha)
      );

      if (foundSuperAdmin || foundAdmin) {
        const adminUser = foundSuperAdmin || foundAdmin;
        
        // Salvar admin logado
        localStorage.setItem('raspou_admin_logged', JSON.stringify(adminUser));
        
        // Redirecionar para o painel correto
        if (adminUser.is_super_admin || adminUser.role === 'super_admin') {
          navigate('/super-admin');
        } else {
          navigate('/admin');
        }
      } else {
        setError('Acesso negado. Apenas administradores podem acessar.');
      }
    } catch (error) {
      console.error('Erro no login admin:', error);
      setError('Erro interno. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Administrativo</h1>
          <p className="text-gray-300 text-sm">Entre com suas credenciais de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@exemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Entrando...
              </div>
            ) : (
              'Entrar como Admin'
            )}
          </button>

          {/* Links */}
          <div className="mt-6 text-center space-y-4">
            <Link
              to="/"
              className="block text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Voltar ao site principal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}