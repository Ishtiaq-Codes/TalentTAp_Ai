import os

path = r"c:\Users\user\OneDrive\Desktop\FYP(SaaS)\frontend\src\pages\auth\RegisterPage.jsx"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<div className="flex min-h-screen bg-background">',
    '''<div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none lg:w-1/2 lg:left-1/2">
        <div className="absolute top-[10%] right-[10%] h-[40vw] w-[40vw] max-w-[500px] animate-pulse-soft rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] h-[40vw] w-[40vw] max-w-[500px] animate-pulse-soft rounded-full bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 blur-[100px]" style={{ animationDelay: '2s' }} />
      </div>'''
)

content = content.replace(
    '<div className="flex flex-1 items-center justify-center p-8">',
    '<div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">'
)

content = content.replace(
    '<div className="w-full max-w-md animate-fade-in-up">',
    '<div className="w-full max-w-md animate-fade-in-up glass-panel rounded-3xl p-6 sm:p-10 border-white/60 shadow-2xl">'
)

content = content.replace(
    'border bg-white',
    'border bg-white/60 backdrop-blur-sm'
)
content = content.replace(
    'focus:border-primary',
    'focus:border-primary focus:bg-white'
)

button_old = '''      <button type="submit"disabled={loading}
       className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all">
       {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"/>
       ) : (
        <>
         Create Account
         <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/>
        </>
       )}
      </button>'''

button_new = '''      <div className="relative mt-8 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-500 animate-pulse-soft"></div>
        <button type="submit" disabled={loading}
         className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all">
         {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"/>
         ) : (
          <>
           Create Account
           <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/>
          </>
         )}
        </button>
      </div>'''

content = content.replace(button_old, button_new)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated RegisterPage.jsx")
