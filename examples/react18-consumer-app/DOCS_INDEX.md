# React 18 Consumer App - Documentation Index

## 🚨 Having componentDidMount Errors?

**Start here:**

1. **[QUICK_FIX.md](./QUICK_FIX.md)** ← **Start Here** - 3-step fix (2 minutes)
2. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Detailed debugging guide
3. **[FIX_SUMMARY.md](./FIX_SUMMARY.md)** - Technical explanation

## 📚 Full Documentation

### Getting Started
- **[README.md](./README.md)** - Complete setup and usage guide

### Problem Resolution
- **[QUICK_FIX.md](./QUICK_FIX.md)** - Fast 3-step solution
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues & solutions
- **[FIX_SUMMARY.md](./FIX_SUMMARY.md)** - Root causes & technical details

### Source Files

#### Working Files (Use These)
- `src/main-fixed.jsx` - Entry point without StrictMode
- `src/App-fixed.jsx` - App component with error handling
- `src/formData-simple.js` - Simplified, tested form metadata

#### Original Files (May Have Issues)
- `src/main.jsx` - Original with StrictMode
- `src/App.jsx` - Original app component
- `src/formData.js` - Original with Section controls

## 🎯 Quick Navigation

### I want to...

**...fix componentDidMount errors**
→ Read [QUICK_FIX.md](./QUICK_FIX.md)

**...understand what went wrong**
→ Read [FIX_SUMMARY.md](./FIX_SUMMARY.md)

**...debug specific errors**
→ Read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**...learn how to use the app**
→ Read [README.md](./README.md)

**...see working code**
→ Check `src/*-fixed.jsx` files

## 📋 Common Scenarios

### Scenario 1: Fresh Setup

```bash
cd examples/react18-consumer-app
npm install
cp src/main-fixed.jsx src/main.jsx
cp src/App-fixed.jsx src/App.jsx
npm run dev
```

✅ Works immediately

### Scenario 2: Already Running, Getting Errors

1. Stop server (Ctrl+C)
2. Follow [QUICK_FIX.md](./QUICK_FIX.md)
3. Restart: `npm run dev`

✅ Errors resolved

### Scenario 3: Custom Form Metadata

1. Use your metadata
2. Follow validation guide in [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. If issues persist, compare with `formData-simple.js`

## 🔍 Error Messages Guide

| Error Message | Solution |
|---------------|----------|
| "Cannot read property of undefined" | [QUICK_FIX.md](./QUICK_FIX.md) |
| "Section control not registered" | Use `formData-simple.js` |
| "componentDidMount called twice" | Use `main-fixed.jsx` |
| "Script execution error" | Remove events from metadata |
| "getValue() returns undefined" | Check mount state in [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |

## 📖 Reading Order

### For Beginners
1. [README.md](./README.md) - Overview
2. [QUICK_FIX.md](./QUICK_FIX.md) - Apply fix
3. Start using the app

### For Developers
1. [FIX_SUMMARY.md](./FIX_SUMMARY.md) - Understand the problem
2. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Debug techniques
3. Review fixed source files

### For Troubleshooting
1. [QUICK_FIX.md](./QUICK_FIX.md) - Try quick fix first
2. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - If that doesn't work
3. [FIX_SUMMARY.md](./FIX_SUMMARY.md) - For deep understanding

## 🛠️ File Comparison

### Entry Points

| File | StrictMode | Use Case |
|------|-----------|----------|
| `main.jsx` | Yes ✅ | Original (may cause issues) |
| `main-fixed.jsx` | No ❌ | Fixed (recommended) |

### App Components

| File | Error Boundary | Mount Tracking | Use Case |
|------|---------------|----------------|----------|
| `App.jsx` | No | No | Original |
| `App-fixed.jsx` | Yes ✅ | Yes ✅ | Fixed (recommended) |

### Form Metadata

| File | Sections | Events | Complexity | Use Case |
|------|----------|--------|-----------|----------|
| `formData.js` | Yes | Yes | High | Original |
| `formData-simple.js` | No | No | Low | Fixed (recommended) |

## 💡 Tips

### Development
- Use fixed files during development
- Check console for mount confirmation
- Enable detailed logging if needed

### Production
- Build with `npm run build`
- Test thoroughly before deploying
- Use error boundaries (included in fixed version)
- Monitor for errors in production

### Testing
- Test with empty observations
- Test with pre-filled data
- Test validation
- Test save/reset/clear operations

## 🆘 Still Need Help?

1. **Check console** - Look for specific error messages
2. **Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Search for your error
3. **Compare code** - Check against working files
4. **Rebuild library** - `cd ../.. && yarn build`
5. **Fresh install** - `rm -rf node_modules && npm install`

## 📞 Support Resources

- Main library: [../../README.md](../../README.md)
- Integration guide: [../../INTEGRATION_GUIDE.md](../../INTEGRATION_GUIDE.md)
- React 19 example: [../react19-consumer-app/](../react19-consumer-app/)
- Bahmni docs: https://bahmni.org

---

**Quick Start:**
```bash
cp src/main-fixed.jsx src/main.jsx
cp src/App-fixed.jsx src/App.jsx
npm run dev
```

**That's it!** 🎉
