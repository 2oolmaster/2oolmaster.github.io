// System Active State
let multitasking = false;
let activeApps = new Set();
let calcResultTransferValue = 0; // Standard calc se zakat calc me value transfer krne k liye
let ageInterval = null; // Age calculator running interval
let uploadedImageSrc = null; // Image converter base64 source

// 1. Live System Clock
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    const clockEl = document.getElementById('liveClock');
    if (clockEl) {
        clockEl.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    }
}
setInterval(updateClock, 1000);
updateClock();

// 2. Multitasking Engine Toggle
function toggleMultitasking() {
    multitasking = !multitasking;
    const knob = document.getElementById('toggleKnob');
    const btn = document.getElementById('multitaskToggle');
    const workspace = document.getElementById('workspace');

    if (multitasking) {
        btn.classList.add('bg-emerald-500');
        btn.classList.remove('bg-gray-700');
        knob.classList.add('translate-x-5');
        workspace.classList.add('lg:grid-cols-2'); 
    } else {
        btn.classList.remove('bg-emerald-500');
        btn.classList.add('bg-gray-700');
        knob.classList.remove('translate-x-5');
        workspace.classList.remove('lg:grid-cols-2');
        
        if (activeApps.size > 1) {
            const appArray = Array.from(activeApps);
            const keepApp = appArray[appArray.length - 1];
            appArray.forEach(appId => {
                if (appId !== keepApp) closeApp(appId);
            });
        }
    }
}

// ----------------------------------------------------
// DYNAMIC APP TEMPLATES & ENGINES (ALL PHASES)
// ----------------------------------------------------
const appTemplates = {
    // 1. Zakat Calculator UI Template
    'zakat-calc': `
        <div class="w-full text-left space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Gold Unit</label>
                    <select id="goldUnit" onchange="calcZakat()" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                        <option value="tola" class="bg-darkBg">Tola</option>
                        <option value="gram" class="bg-darkBg">Gram</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Gold Weight</label>
                    <input type="number" id="goldWeight" oninput="calcZakat()" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Silver Unit</label>
                    <select id="silverUnit" onchange="calcZakat()" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                        <option value="tola" class="bg-darkBg">Tola</option>
                        <option value="gram" class="bg-darkBg">Gram</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Silver Weight</label>
                    <input type="number" id="silverWeight" oninput="calcZakat()" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                </div>
            </div>

            <div class="space-y-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Cash (In Hand, Bank, Savings)</label>
                    <input type="number" id="zakatCash" oninput="calcZakat()" placeholder="PKR 0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Other Assets (Business Stock, Shares)</label>
                    <input type="number" id="zakatAssets" oninput="calcZakat()" placeholder="PKR 0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold text-rose-400">Liabilities (Debts, Unpaid Bills)</label>
                    <input type="number" id="zakatDebts" oninput="calcZakat()" placeholder="PKR 0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500">
                </div>
            </div>

            <div class="border-t border-white/10 pt-4 mt-2">
                <div class="bg-black/40 rounded-xl p-4 space-y-2 border border-white/5">
                    <div class="flex justify-between text-xs text-gray-400">
                        <span>Total Net Wealth:</span>
                        <span id="zakatNet" class="font-bold text-white">PKR 0</span>
                    </div>
                    <div class="flex justify-between text-xs text-gray-400">
                        <span>Nisab Level (Silver standard):</span>
                        <span id="zakatNisab" class="font-bold text-amber-400">PKR 136,500</span>
                    </div>
                    <div class="flex justify-between text-sm font-extrabold pt-2 border-t border-white/5">
                        <span class="text-emerald-400">Zakat Due (2.5%):</span>
                        <span id="zakatResult" class="text-emerald-400">PKR 0</span>
                    </div>
                </div>
            </div>
        </div>
    `,

    // 2. Standard Calculator UI Template
    'standard-calc': `
        <div class="w-full max-w-xs mx-auto text-left space-y-4">
            <div class="bg-black/50 border border-white/10 rounded-2xl p-4 text-right">
                <div id="calcHistory" class="text-xs text-gray-500 h-5 overflow-hidden tracking-widest"></div>
                <div id="calcScreen" class="text-2xl font-bold text-white truncate tracking-wider mt-1">0</div>
            </div>
            
            <div class="grid grid-cols-4 gap-2">
                <button onclick="pressCalc('C')" class="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl transition-all">C</button>
                <button onclick="pressCalc('(')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all">(</button>
                <button onclick="pressCalc(')')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all">)</button>
                <button onclick="pressCalc('/')" class="p-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-xl transition-all">/</button>
                
                <button onclick="pressCalc('7')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">7</button>
                <button onclick="pressCalc('8')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">8</button>
                <button onclick="pressCalc('9')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">9</button>
                <button onclick="pressCalc('*')" class="p-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-xl transition-all">*</button>
                
                <button onclick="pressCalc('4')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">4</button>
                <button onclick="pressCalc('5')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">5</button>
                <button onclick="pressCalc('6')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">6</button>
                <button onclick="pressCalc('-')" class="p-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-xl transition-all">-</button>
                
                <button onclick="pressCalc('1')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">1</button>
                <button onclick="pressCalc('2')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">2</button>
                <button onclick="pressCalc('3')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">3</button>
                <button onclick="pressCalc('+')" class="p-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-xl transition-all">+</button>
                
                <button onclick="pressCalc('0')" class="p-3 col-span-2 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">0</button>
                <button onclick="pressCalc('.')" class="p-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">.</button>
                <button onclick="pressCalc('=')" class="p-3 bg-emerald-500 hover:bg-emerald-600 text-darkBg font-bold rounded-xl transition-all">=</button>
            </div>

            <!-- Transfer to Zakat button (Premium UX flow) -->
            <button id="transferBtn" onclick="transferToZakat()" class="w-full hidden items-center justify-center gap-2 py-2 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/20 transition-all">
                <i data-lucide="coins" class="w-4 h-4"></i> Send Value to Zakat Calculator
            </button>
        </div>
    `,

    // 3. Fitrana & Sadqah UI Template
    'sadqah-calc': `
        <div class="w-full text-left space-y-4">
            <div>
                <label class="block text-xs text-gray-400 mb-1 font-semibold">Select Commodity Standard</label>
                <select id="sadqahCommodity" onchange="calcFitrana()" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500">
                    <option value="350" class="bg-darkBg">Wheat (Gandum) - Rs. 350 approx</option>
                    <option value="800" class="bg-darkBg">Barley (Jau) - Rs. 800 approx</option>
                    <option value="2400" class="bg-darkBg">Dates (Khajoor) - Rs. 2,400 approx</option>
                    <option value="3200" class="bg-darkBg">Raisins (Kishmish) - Rs. 3,200 approx</option>
                </select>
                <p class="text-[10px] text-gray-500 mt-1">Rates are based on standard weight guidelines (approx 2kg of wheat, or 3.5kg of others).</p>
            </div>

            <div>
                <label class="block text-xs text-gray-400 mb-1 font-semibold">Number of Family Members</label>
                <input type="number" id="familyMembers" oninput="calcFitrana()" value="1" min="1" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
            </div>

            <div class="border-t border-white/10 pt-4 mt-4">
                <div class="bg-amber-500/5 rounded-2xl p-5 border border-amber-500/10 text-center space-y-1">
                    <span class="text-xs text-gray-400 block">Calculated Due Fitrana / Sadqah-e-Fitr</span>
                    <h4 id="fitranaTotal" class="text-2xl font-black text-amber-400">PKR 350</h4>
                    <p class="text-[10px] text-gray-500 mt-2">Payable before Eid-ul-Fitr prayers on behalf of every household member.</p>
                </div>
            </div>
        </div>
    `,

    // 4. Salary Tax Calculator UI Template
    'tax-calc': `
        <div class="w-full text-left space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Salary Frequency</label>
                    <div class="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                        <button id="freqMonthly" onclick="setTaxFreq('monthly')" class="py-2 text-xs font-semibold rounded-lg bg-teal-500 text-darkBg transition-all">Monthly</button>
                        <button id="freqYearly" onclick="setTaxFreq('yearly')" class="py-2 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all">Yearly</button>
                    </div>
                </div>
                
                <div class="col-span-2">
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Salary Income (PKR)</label>
                    <input type="number" id="taxSalaryInput" oninput="calcTax()" placeholder="Enter amount" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500">
                </div>
            </div>

            <div class="border-t border-white/10 pt-4 space-y-3">
                <div class="bg-black/40 rounded-xl p-4 border border-white/5 space-y-2">
                    <div class="flex justify-between text-xs text-gray-400">
                        <span>Annual Taxable Income:</span>
                        <span id="taxAnnualIncome" class="font-bold text-white">PKR 0</span>
                    </div>
                    <div class="flex justify-between text-xs text-rose-400">
                        <span>Calculated Income Tax:</span>
                        <span id="taxAmount" class="font-bold">PKR 0</span>
                    </div>
                    <div class="flex justify-between text-xs text-gray-400">
                        <span>Effective Tax Rate:</span>
                        <span id="taxRate" class="font-bold">0%</span>
                    </div>
                    <div class="flex justify-between text-sm font-extrabold pt-2 border-t border-white/5 text-teal-400">
                        <span>Net Take-home (Monthly):</span>
                        <span id="taxTakeHome">PKR 0</span>
                    </div>
                </div>
                <p class="text-[10px] text-gray-500 leading-relaxed text-center">Calculations based on standard FBR salaried slab rates for FY 2026-2027.</p>
            </div>
        </div>
    `,

    // 5. Local Land Area Converter (Batch B)
    'land-converter': `
        <div class="w-full text-left space-y-4">
            <div>
                <label class="block text-xs text-gray-400 mb-1 font-semibold">Marla Standard</label>
                <div class="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                    <button id="marla272" onclick="setMarlaStandard(272.25)" class="py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-darkBg transition-all">272.25 Sq Ft (Govt)</button>
                    <button id="marla225" onclick="setMarlaStandard(225)" class="py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all">225 Sq Ft (Local)</button>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Marla</label>
                    <input type="number" id="landMarla" oninput="convertLand('marla')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Kanal</label>
                    <input type="number" id="landKanal" oninput="convertLand('kanal')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Square Feet</label>
                    <input type="number" id="landSqFt" oninput="convertLand('sqft')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">Square Yards (Gazz)</label>
                    <input type="number" id="landSqYards" oninput="convertLand('sqyards')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                </div>
            </div>
        </div>
    `,

    // 6. Client-Side File Converter (Batch B)
    'file-converter': `
        <div class="w-full text-left space-y-4">
            <div class="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all relative">
                <input type="file" id="imageInput" accept="image/png, image/jpeg" onchange="handleImageUpload(event)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <i data-lucide="image" class="w-10 h-10 mx-auto mb-2 text-gray-400"></i>
                <p class="text-xs text-gray-300 font-semibold">Drag & Drop or Click to Upload Image</p>
                <p class="text-[10px] text-gray-500 mt-1">Supports PNG, JPG, JPEG (Processed 100% Client-Side)</p>
            </div>
            <div id="imagePreviewContainer" class="hidden space-y-3">
                <div class="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <img id="upload-preview" class="w-12 h-12 rounded-lg object-cover border border-white/10">
                    <div class="flex-grow">
                        <span class="text-xs text-white block truncate max-w-[150px]">Original File</span>
                        <span id="original-size" class="text-[10px] text-gray-400">0 KB</span>
                    </div>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1 font-semibold">WebP Quality</label>
                    <input type="range" id="webp-quality" min="0.1" max="1.0" step="0.1" value="0.8" class="w-full accent-emerald-500">
                </div>
                <button id="convert-btn" onclick="convertToWebP()" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-darkBg font-bold rounded-xl transition-all">Convert to WebP Instantly</button>
                <div id="conversion-result-box" class="hidden bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center space-y-2">
                    <span class="text-xs text-emerald-400 font-semibold block">Conversion Completed!</span>
                    <span id="webp-size" class="text-xs text-gray-300 block">WebP Size: 0 KB</span>
                    <a id="download-link" class="inline-block py-1.5 px-4 bg-emerald-500 text-darkBg text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all">Download WebP</a>
                </div>
            </div>
        </div>
    `,

    // 7. Multi-Unit Converter (Batch B)
    'unit-converter': `
        <div class="w-full text-left space-y-4">
            <div class="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button onclick="switchUnitTab('length')" id="tab-length" class="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500 text-white transition-all">Length</button>
                <button onclick="switchUnitTab('weight')" id="tab-weight" class="flex-1 py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all">Weight</button>
                <button onclick="switchUnitTab('temp')" id="tab-temp" class="flex-1 py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all">Temp</button>
            </div>
            <!-- Length Tab -->
            <div id="unit-length-container" class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Meters</label>
                        <input type="number" id="unitMeter" oninput="convertLength('meter')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Kilometers</label>
                        <input type="number" id="unitKm" oninput="convertLength('km')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Feet</label>
                        <input type="number" id="unitFeet" oninput="convertLength('feet')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Inches</label>
                        <input type="number" id="unitInches" oninput="convertLength('inches')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none">
                    </div>
                </div>
            </div>
            <!-- Weight Tab -->
            <div id="unit-weight-container" class="hidden space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Kilograms (kg)</label>
                        <input type="number" id="unitKg" oninput="convertWeight('kg')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Pounds (lbs)</label>
                        <input type="number" id="unitLbs" oninput="convertWeight('lbs')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Tola (Pakistani)</label>
                        <input type="number" id="unitTola" oninput="convertWeight('tola')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Grams (g)</label>
                        <input type="number" id="unitGrams" oninput="convertWeight('grams')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none">
                    </div>
                </div>
            </div>
            <!-- Temp Tab -->
            <div id="unit-temp-container" class="hidden space-y-3">
                <div class="grid grid-cols-3 gap-2">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Celsius (°C)</label>
                        <input type="number" id="unitCel" oninput="convertTemp('cel')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-sm text-white focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Fahrenheit (°F)</label>
                        <input type="number" id="unitFah" oninput="convertTemp('fah')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-sm text-white focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Kelvin (K)</label>
                        <input type="number" id="unitKel" oninput="convertTemp('kel')" placeholder="0" class="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-sm text-white focus:outline-none">
                    </div>
                </div>
            </div>
        </div>
    `,

    // 8. Ultra Password Generator (Batch C)
    'pass-gen': `
        <div class="w-full text-left space-y-4">
            <div class="relative bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <span id="passOutput" class="text-sm font-mono text-emerald-400 tracking-wider select-all truncate max-w-[70%]">Click Generate</span>
                <button onclick="copyPassword()" class="text-gray-400 hover:text-emerald-400 transition-colors">
                    <i data-lucide="copy" class="w-4 h-4"></i>
                </button>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between text-xs text-gray-400">
                    <span>Length: <span id="passLengthVal" class="font-bold text-white">12</span></span>
                </div>
                <input type="range" id="passLength" min="6" max="32" value="12" oninput="updatePassLength(this.value)" class="w-full accent-emerald-500">
            </div>
            <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 text-xs text-white cursor-pointer">
                    <input type="checkbox" id="passUpper" checked onchange="generatePassword()" class="accent-emerald-500"> Uppercase (A-Z)
                </label>
                <label class="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 text-xs text-white cursor-pointer">
                    <input type="checkbox" id="passLower" checked onchange="generatePassword()" class="accent-emerald-500"> Lowercase (a-z)
                </label>
                <label class="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 text-xs text-white cursor-pointer">
                    <input type="checkbox" id="passNumbers" checked onchange="generatePassword()" class="accent-emerald-500"> Numbers (0-9)
                </label>
                <label class="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 text-xs text-white cursor-pointer">
                    <input type="checkbox" id="passSymbols" onchange="generatePassword()" class="accent-emerald-500"> Symbols (@#$%)
                </label>
            </div>
            <div>
                <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div id="passStrengthBar" class="h-full w-0 bg-rose-500 transition-all duration-300"></div>
                </div>
                <span id="passStrengthText" class="text-[10px] text-rose-400 mt-1 block">Weak Password</span>
            </div>
            <button onclick="generatePassword()" class="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-darkBg font-bold rounded-xl transition-all">Generate Password</button>
        </div>
    `,

    // 9. QR Code Generator (Batch C)
    'qr-generator': `
        <div class="w-full text-left space-y-4">
            <div>
                <label class="block text-xs text-gray-400 mb-1 font-semibold">Enter Text or URL</label>
                <input type="text" id="qrText" placeholder="https://example.com" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
            </div>
            <div class="flex justify-center">
                <div id="qrOutput" class="p-3 bg-white rounded-xl inline-block shadow-lg">
                    <!-- Dynamic QR Canvas will inject here -->
                    <div class="w-32 h-32 flex items-center justify-center text-xs text-gray-500">No QR Generated</div>
                </div>
            </div>
            <button onclick="generateQRCode()" class="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all">Generate QR Code</button>
        </div>
    `,

    // 10. Interactive BMI Calculator (Batch C)
    'bmi-calc': `
        <div class="w-full text-left space-y-4">
            <div class="space-y-3">
                <div>
                    <div class="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Height: <span id="bmiHeightVal" class="font-bold text-white">170 cm</span></span>
                    </div>
                    <input type="range" id="bmiHeight" min="100" max="220" value="170" oninput="calcBMI()" class="w-full accent-teal-500">
                </div>
                <div>
                    <div class="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Weight: <span id="bmiWeightVal" class="font-bold text-white">70 kg</span></span>
                    </div>
                    <input type="range" id="bmiWeight" min="30" max="150" value="70" oninput="calcBMI()" class="w-full accent-teal-500">
                </div>
            </div>
            <div class="border-t border-white/10 pt-4 text-center space-y-2">
                <div class="bg-black/40 rounded-xl p-4 border border-white/5 space-y-1">
                    <span class="text-xs text-gray-400 block">Your Calculated BMI</span>
                    <h4 id="bmiResultValue" class="text-3xl font-black text-teal-400">24.2</h4>
                    <span id="bmiResultStatus" class="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">Normal Weight</span>
                </div>
            </div>
        </div>
    `,

    // 11. Ultimate Age Calculator (Batch C)
    'age-calc': `
        <div class="w-full text-left space-y-4">
            <div>
                <label class="block text-xs text-gray-400 mb-1 font-semibold">Select Date of Birth</label>
                <input type="date" id="dob-input" onchange="calcAge()" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div class="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                    <span class="text-[10px] text-gray-400 block uppercase">Years</span>
                    <span id="age-years" class="text-lg font-bold text-white">0</span>
                </div>
                <div class="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                    <span class="text-[10px] text-gray-400 block uppercase">Months</span>
                    <span id="age-months" class="text-lg font-bold text-white">0</span>
                </div>
                <div class="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                    <span class="text-[10px] text-gray-400 block uppercase">Days</span>
                    <span id="age-days" class="text-lg font-bold text-white">0</span>
                </div>
            </div>
            <div class="bg-amber-500/5 rounded-xl p-3 border border-amber-500/10 space-y-1.5 text-xs text-gray-300">
                <div class="flex justify-between">
                    <span>Zodiac Sign:</span>
                    <span id="zodiac-sign" class="font-bold text-amber-400">-</span>
                </div>
                <div class="flex justify-between">
                    <span>Next Birthday Countdown:</span>
                    <span id="bday-countdown" class="font-bold text-white">-</span>
                </div>
                <div class="flex justify-between">
                    <span>Total Life Seconds:</span>
                    <span id="age-seconds" class="font-mono text-white text-[10px]">-</span>
                </div>
            </div>
        </div>
    `,

    // 12. CV/Resume Maker (Batch C)
    'cv-maker': `
        <div class="w-full text-left space-y-4">
            <div class="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                <div class="col-span-2">
                    <label class="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">Full Name</label>
                    <input type="text" id="cvName" oninput="updateCV()" value="Muhammad Ahmad" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none">
                </div>
                <div>
                    <label class="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">Designation</label>
                    <input type="text" id="cvTitle" oninput="updateCV()" value="Software Engineer" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none">
                </div>
                <div>
                    <label class="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">Phone</label>
                    <input type="text" id="cvPhone" oninput="updateCV()" value="+92 300 1234567" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none">
                </div>
                <div class="col-span-2">
                    <label class="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">Email</label>
                    <input type="text" id="cvEmail" oninput="updateCV()" value="ahmad@example.com" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none">
                </div>
                <div class="col-span-2">
                    <label class="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">Professional Summary</label>
                    <textarea id="cvSummary" oninput="updateCV()" rows="2" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none resize-none">Experienced modern frontend web developer specializing in clean client-side single page web structures.</textarea>
                </div>
                <div class="col-span-2">
                    <label class="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">Experience (Company, Role, Years)</label>
                    <textarea id="cvExp" oninput="updateCV()" rows="2" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none resize-none">Senior Web Dev at Faisalabad Tech (2024 - Present)&#10;Built performance-driven system dashboards.</textarea>
                </div>
            </div>
            
            <!-- Hidden Printable A4 Preview Box -->
            <div class="hidden">
                <div id="cv-preview-area" class="bg-white text-black p-8 font-sans w-full max-w-[800px] mx-auto leading-normal">
                    <div class="border-b-2 border-black pb-4 mb-4">
                        <h1 id="previewName" class="text-3xl font-black uppercase tracking-wide m-0">Muhammad Ahmad</h1>
                        <p id="previewTitle" class="text-sm font-bold text-gray-600 m-0 mt-1">Software Engineer</p>
                        <div class="flex gap-4 text-xs text-gray-500 mt-2">
                            <span id="previewPhone">+92 300 1234567</span> | 
                            <span id="previewEmail">ahmad@example.com</span>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <h3 class="text-xs font-black uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Professional Summary</h3>
                            <p id="previewSummary" class="text-xs text-gray-700 leading-relaxed m-0">Experienced modern frontend web developer.</p>
                        </div>
                        <div>
                            <h3 class="text-xs font-black uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Work Experience</h3>
                            <p id="previewExp" class="text-xs text-gray-700 leading-relaxed whitespace-pre-line m-0">Senior Web Dev.</p>
                        </div>
                    </div>
                </div>
            </div>

            <button onclick="printCV()" class="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                <i data-lucide="printer" class="w-4 h-4"></i> Generate & Print Professional A4 CV
            </button>
        </div>
    `
};

// ----------------------------------------------------
// DYNAMIC APP MOUNT & INITIALIZATION
// ----------------------------------------------------
function launchApp(id, title, colorClass, iconName) {
    const workspace = document.getElementById('workspace');
    
    // Single-tasking configuration cleaner
    if (!multitasking) {
        activeApps.forEach(appId => closeApp(appId));
    }

    // Return if app window already exists
    if (activeApps.has(id)) {
        const existingWin = document.getElementById(`win-${id}`);
        if (existingWin) {
            existingWin.classList.add('ring-2', `ring-${colorClass}-500`);
            setTimeout(() => existingWin.classList.remove('ring-2', `ring-${colorClass}-500`), 800);
        }
        return;
    }

    activeApps.add(id);
    updateUrlHash(id);

    // Dynamic UI Mounting Layout
    const windowHtml = `
        <div id="win-${id}" class="glassmorphism bg-glassBg border border-glassBorder rounded-2xl flex flex-col p-6 backdrop-blur-md transition-all duration-500 transform scale-95 opacity-0">
            <div class="flex justify-between items-center pb-4 mb-4 border-b border-glassBorder">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-${colorClass}-500/10 text-${colorClass}-400 flex items-center justify-center">
                        <i data-lucide="${iconName}" class="w-5 h-5"></i>
                    </div>
                    <h3 class="font-bold text-white text-md">${title}</h3>
                </div>
                <button onclick="closeApp('${id}')" class="text-gray-400 hover:text-rose-500 transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div id="app-content-${id}" class="flex-grow flex items-center justify-center text-gray-400">
                ${appTemplates[id] ? appTemplates[id] : `
                    <div class="text-center">
                        <p class="text-sm">App framework mounting successfully...</p>
                        <span class="text-xs text-gray-600 block mt-1">${id.toUpperCase()} Client Engine Loaded</span>
                    </div>
                `}
            </div>
        </div>
    `;

    workspace.insertAdjacentHTML('beforeend', windowHtml);
    workspace.classList.remove('hidden');
    workspace.classList.add('grid');

    // Smooth entry transition
    setTimeout(() => {
        const win = document.getElementById(`win-${id}`);
        if (win) {
            win.classList.remove('scale-95', 'opacity-0');
            win.classList.add('scale-100', 'opacity-100');
        }
    }, 50);

    // Initializer calls
    if (id === 'zakat-calc') initZakat();
    if (id === 'standard-calc') initCalc();
    if (id === 'sadqah-calc') calcFitrana();
    if (id === 'tax-calc') initTax();
    if (id === 'land-converter') setMarlaStandard(272.25);
    if (id === 'file-converter') initFileConverter();
    if (id === 'unit-converter') switchUnitTab('length');
    if (id === 'pass-gen') generatePassword();
    if (id === 'bmi-calc') calcBMI();
    if (id === 'age-calc') initAgeCalc();
    if (id === 'cv-maker') updateCV();

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function closeApp(id) {
    const win = document.getElementById(`win-${id}`);
    if (win) {
        win.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            win.remove();
            activeApps.delete(id);
            if (id === 'age-calc' && ageInterval) {
                clearInterval(ageInterval);
            }
            if (activeApps.size === 0) {
                const workspace = document.getElementById('workspace');
                workspace.classList.add('hidden');
                workspace.classList.remove('grid');
                clearUrlHash();
            }
        }, 300);
    }
}

// ----------------------------------------------------
// BATCH A CALCULATION MODULES
// ----------------------------------------------------

// === MODULE 1: ZAKAT CALCULATOR ===
function initZakat() {
    if (calcResultTransferValue > 0) {
        const cashInput = document.getElementById('zakatCash');
        if (cashInput) {
            cashInput.value = Math.round(calcResultTransferValue);
            calcResultTransferValue = 0; // reset
        }
    }
    calcZakat();
}

function calcZakat() {
    const GOLD_TOLA_RATE = 235000;
    const SILVER_TOLA_RATE = 2600;
    const GOLD_GRAM_RATE = GOLD_TOLA_RATE / 11.66;
    const SILVER_GRAM_RATE = SILVER_TOLA_RATE / 11.66;

    const goldUnit = document.getElementById('goldUnit').value;
    const goldWeight = parseFloat(document.getElementById('goldWeight').value) || 0;
    const silverUnit = document.getElementById('silverUnit').value;
    const silverWeight = parseFloat(document.getElementById('silverWeight').value) || 0;
    const cash = parseFloat(document.getElementById('zakatCash').value) || 0;
    const assets = parseFloat(document.getElementById('zakatAssets').value) || 0;
    const debts = parseFloat(document.getElementById('zakatDebts').value) || 0;

    const goldValue = goldWeight * (goldUnit === 'tola' ? GOLD_TOLA_RATE : GOLD_GRAM_RATE);
    const silverValue = silverWeight * (silverUnit === 'tola' ? SILVER_TOLA_RATE : SILVER_GRAM_RATE);
    
    const netWealth = (cash + goldValue + silverValue + assets) - debts;
    const nisabLevel = 52.5 * SILVER_TOLA_RATE;

    document.getElementById('zakatNet').textContent = `PKR ${Math.max(0, netWealth).toLocaleString()}`;
    document.getElementById('zakatNisab').textContent = `PKR ${nisabLevel.toLocaleString()}`;

    if (netWealth >= nisabLevel) {
        const zakatDue = netWealth * 0.025;
        document.getElementById('zakatResult').textContent = `PKR ${Math.round(zakatDue).toLocaleString()}`;
    } else {
        document.getElementById('zakatResult').textContent = `PKR 0 (Below Nisab)`;
    }
}

// === MODULE 2: STANDARD CALCULATOR ===
let calcBuffer = '';
function initCalc() {
    calcBuffer = '';
    updateCalcDisplay();
}

function pressCalc(char) {
    const screen = document.getElementById('calcScreen');
    const history = document.getElementById('calcHistory');
    const transferBtn = document.getElementById('transferBtn');

    if (char === 'C') {
        calcBuffer = '';
        history.textContent = '';
        transferBtn.classList.add('hidden');
        transferBtn.classList.remove('flex');
    } else if (char === '=') {
        try {
            const result = eval(calcBuffer);
            history.textContent = calcBuffer + ' =';
            calcBuffer = result.toString();
            
            if (!isNaN(result) && result > 0) {
                calcResultTransferValue = result;
                transferBtn.classList.remove('hidden');
                transferBtn.classList.add('flex');
            }
        } catch (e) {
            calcBuffer = 'Error';
            transferBtn.classList.add('hidden');
            transferBtn.classList.remove('flex');
        }
    } else {
        if (calcBuffer === 'Error' || calcBuffer === '0') {
            calcBuffer = '';
        }
        calcBuffer += char;
    }
    updateCalcDisplay();
}

function updateCalcDisplay() {
    const screen = document.getElementById('calcScreen');
    if (screen) {
        screen.textContent = calcBuffer || '0';
    }
}

function transferToZakat() {
    if (!activeApps.has('zakat-calc')) {
        launchApp('zakat-calc', 'Premium Zakat Calculator', 'emerald', 'coins');
    } else {
        const cashInput = document.getElementById('zakatCash');
        if (cashInput) {
            cashInput.value = Math.round(calcResultTransferValue);
            calcZakat();
            cashInput.focus();
            cashInput.classList.add('ring-2', 'ring-emerald-500');
            setTimeout(() => cashInput.classList.remove('ring-2', 'ring-emerald-500'), 1000);
        }
        calcResultTransferValue = 0;
    }
}

// === MODULE 3: FITRANA CALCULATOR ===
function calcFitrana() {
    const rate = parseInt(document.getElementById('sadqahCommodity').value) || 350;
    const members = parseInt(document.getElementById('familyMembers').value) || 1;
    const total = rate * members;
    
    const fitranaResultEl = document.getElementById('fitranaTotal');
    if (fitranaResultEl) {
        fitranaResultEl.textContent = `PKR ${total.toLocaleString()}`;
    }
}

// === MODULE 4: SALARY TAX CALCULATOR ===
let taxFrequency = 'monthly';

function initTax() {
    setTaxFreq('monthly');
    calcTax();
}

function setTaxFreq(freq) {
    taxFrequency = freq;
    const mBtn = document.getElementById('freqMonthly');
    const yBtn = document.getElementById('freqYearly');

    if (freq === 'monthly') {
        mBtn.className = "py-2 text-xs font-semibold rounded-lg bg-teal-500 text-darkBg transition-all";
        yBtn.className = "py-2 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all";
    } else {
        yBtn.className = "py-2 text-xs font-semibold rounded-lg bg-teal-500 text-darkBg transition-all";
        mBtn.className = "py-2 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all";
    }
    calcTax();
}

function calcTax() {
    const inputVal = parseFloat(document.getElementById('taxSalaryInput').value) || 0;
    let annualIncome = taxFrequency === 'monthly' ? inputVal * 12 : inputVal;
    let tax = 0;

    if (annualIncome <= 600000) {
        tax = 0;
    } else if (annualIncome <= 1200000) {
        tax = (annualIncome - 600000) * 0.05;
    } else if (annualIncome <= 2200000) {
        tax = 30000 + (annualIncome - 1200000) * 0.15;
    } else if (annualIncome <= 3200000) {
        tax = 180000 + (annualIncome - 2200000) * 0.25;
    } else if (annualIncome <= 4100000) {
        tax = 430000 + (annualIncome - 3200000) * 0.30;
    } else {
        tax = 700000 + (annualIncome - 4100000) * 0.35;
    }

    const monthlyTax = tax / 12;
    const monthlyIncome = annualIncome / 12;
    const netMonthlyTakeHome = monthlyIncome - monthlyTax;
    const effectiveRate = annualIncome > 0 ? (tax / annualIncome) * 100 : 0;

    document.getElementById('taxAnnualIncome').textContent = `PKR ${Math.round(annualIncome).toLocaleString()}`;
    document.getElementById('taxAmount').textContent = `PKR ${Math.round(tax).toLocaleString()} / year`;
    document.getElementById('taxRate').textContent = `${effectiveRate.toFixed(1)}%`;
    document.getElementById('taxTakeHome').textContent = `PKR ${Math.round(netMonthlyTakeHome).toLocaleString()}`;
}

// ----------------------------------------------------
// BATCH B CALCULATION MODULES
// ----------------------------------------------------

// === MODULE 5: LOCAL LAND AREA CONVERTER ===
let activeMarlaFactor = 272.25;

function setMarlaStandard(factor) {
    activeMarlaFactor = factor;
    const btn272 = document.getElementById('marla272');
    const btn225 = document.getElementById('marla225');

    if (factor === 272.25) {
        btn272.className = "py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-darkBg transition-all";
        btn225.className = "py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all";
    } else {
        btn225.className = "py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-darkBg transition-all";
        btn272.className = "py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all";
    }
    // Refresh conversions based on current Marla value
    convertLand('marla');
}

function convertLand(source) {
    const marlaInput = document.getElementById('landMarla');
    const kanalInput = document.getElementById('landKanal');
    const sqftInput = document.getElementById('landSqFt');
    const sqyardsInput = document.getElementById('landSqYards');

    let sqft = 0;

    if (source === 'marla') {
        const marla = parseFloat(marlaInput.value) || 0;
        sqft = marla * activeMarlaFactor;
    } else if (source === 'kanal') {
        const kanal = parseFloat(kanalInput.value) || 0;
        sqft = kanal * 20 * activeMarlaFactor;
    } else if (source === 'sqft') {
        sqft = parseFloat(sqftInput.value) || 0;
    } else if (source === 'sqyards') {
        const sqyards = parseFloat(sqyardsInput.value) || 0;
        sqft = sqyards * 9;
    }

    if (source !== 'marla') marlaInput.value = (sqft / activeMarlaFactor).toFixed(3);
    if (source !== 'kanal') kanalInput.value = (sqft / (activeMarlaFactor * 20)).toFixed(3);
    if (source !== 'sqft') sqftInput.value = sqft.toFixed(2);
    if (source !== 'sqyards') sqyardsInput.value = (sqft / 9).toFixed(3);
}

// === MODULE 6: CLIENT-SIDE IMAGE CONVERTER ===
function initFileConverter() {
    uploadedImageSrc = null;
    const container = document.getElementById('imagePreviewContainer');
    if (container) container.classList.add('hidden');
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageSrc = e.target.result;
        document.getElementById('upload-preview').src = uploadedImageSrc;
        document.getElementById('original-size').textContent = (file.size / 1024).toFixed(1) + ' KB';
        document.getElementById('imagePreviewContainer').classList.remove('hidden');
        document.getElementById('conversion-result-box').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

function convertToWebP() {
    if (!uploadedImageSrc) return;

    const img = new Image();
    img.src = uploadedImageSrc;
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const quality = parseFloat(document.getElementById('webp-quality').value) || 0.8;
        const webpDataUrl = canvas.toDataURL('image/webp', quality);

        const downloadLink = document.getElementById('download-link');
        downloadLink.href = webpDataUrl;
        downloadLink.download = 'kingpopcorn_converted.webp';

        const approxSize = (webpDataUrl.length * 0.75) / 1024;
        document.getElementById('webp-size').textContent = `Optimized WebP Size: ${approxSize.toFixed(1)} KB`;
        document.getElementById('conversion-result-box').classList.remove('hidden');
    };
}

// === MODULE 7: MULTI-UNIT CONVERTER ===
function switchUnitTab(tab) {
    const tabs = ['length', 'weight', 'temp'];
    tabs.forEach(t => {
        const container = document.getElementById(`unit-${t}-container`);
        const btn = document.getElementById(`tab-${t}`);
        if (t === tab) {
            container.classList.remove('hidden');
            btn.className = "flex-1 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500 text-white transition-all";
        } else {
            container.classList.add('hidden');
            btn.className = "flex-1 py-1.5 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition-all";
        }
    });
}

function convertLength(source) {
    const m = document.getElementById('unitMeter');
    const km = document.getElementById('unitKm');
    const ft = document.getElementById('unitFeet');
    const inch = document.getElementById('unitInches');

    let baseInMeters = 0;
    if (source === 'meter') baseInMeters = parseFloat(m.value) || 0;
    if (source === 'km') baseInMeters = (parseFloat(km.value) || 0) * 1000;
    if (source === 'feet') baseInMeters = (parseFloat(ft.value) || 0) * 0.3048;
    if (source === 'inches') baseInMeters = (parseFloat(inch.value) || 0) * 0.0254;

    if (source !== 'meter') m.value = baseInMeters.toFixed(3);
    if (source !== 'km') km.value = (baseInMeters / 1000).toFixed(4);
    if (source !== 'feet') ft.value = (baseInMeters / 0.3048).toFixed(3);
    if (source !== 'inches') inch.value = (baseInMeters / 0.0254).toFixed(2);
}

function convertWeight(source) {
    const kg = document.getElementById('unitKg');
    const lbs = document.getElementById('unitLbs');
    const tola = document.getElementById('unitTola');
    const grams = document.getElementById('unitGrams');

    let baseInGrams = 0;
    if (source === 'kg') baseInGrams = (parseFloat(kg.value) || 0) * 1000;
    if (source === 'lbs') baseInGrams = (parseFloat(lbs.value) || 0) * 453.59237;
    if (source === 'tola') baseInGrams = (parseFloat(tola.value) || 0) * 11.664;
    if (source === 'grams') baseInGrams = parseFloat(grams.value) || 0;

    if (source !== 'kg') kg.value = (baseInGrams / 1000).toFixed(3);
    if (source !== 'lbs') lbs.value = (baseInGrams / 453.59237).toFixed(3);
    if (source !== 'tola') tola.value = (baseInGrams / 11.664).toFixed(3);
    if (source !== 'grams') grams.value = baseInGrams.toFixed(2);
}

function convertTemp(source) {
    const cel = document.getElementById('unitCel');
    const fah = document.getElementById('unitFah');
    const kel = document.getElementById('unitKel');

    let baseInCel = 0;
    if (source === 'cel') baseInCel = parseFloat(cel.value) || 0;
    if (source === 'fah') baseInCel = ((parseFloat(fah.value) || 0) - 32) * 5/9;
    if (source === 'kel') baseInCel = (parseFloat(kel.value) || 0) - 273.15;

    if (source !== 'cel') cel.value = baseInCel.toFixed(2);
    if (source !== 'fah') fah.value = (baseInCel * 9/5 + 32).toFixed(2);
    if (source !== 'kel') kel.value = (baseInCel + 273.15).toFixed(2);
}

// ----------------------------------------------------
// BATCH C CALCULATION MODULES
// ----------------------------------------------------

// === MODULE 8: ULTRA PASSWORD GENERATOR ===
function updatePassLength(val) {
    document.getElementById('passLengthVal').textContent = val;
    generatePassword();
}

function generatePassword() {
    const length = parseInt(document.getElementById('passLength').value) || 12;
    const hasUpper = document.getElementById('passUpper').checked;
    const hasLower = document.getElementById('passLower').checked;
    const hasNumbers = document.getElementById('passNumbers').checked;
    const hasSymbols = document.getElementById('passSymbols').checked;

    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowers = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let pool = '';
    if (hasUpper) pool += uppers;
    if (hasLower) pool += lowers;
    if (hasNumbers) pool += numbers;
    if (hasSymbols) pool += symbols;

    if (!pool) {
        document.getElementById('passOutput').textContent = 'Select at least one option!';
        return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += pool.charAt(Math.floor(Math.random() * pool.length));
    }

    document.getElementById('passOutput').textContent = password;
    updatePassStrength(password, length, hasSymbols);
}

function updatePassStrength(password, length, hasSymbols) {
    const bar = document.getElementById('passStrengthBar');
    const label = document.getElementById('passStrengthText');
    
    let strength = 0;
    if (length >= 8) strength++;
    if (length >= 14) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (hasSymbols) strength++;

    if (strength <= 2) {
        bar.className = "h-full w-[30%] bg-rose-500 transition-all duration-300";
        label.textContent = "Weak Password";
        label.className = "text-[10px] text-rose-400 mt-1 block";
    } else if (strength <= 4) {
        bar.className = "h-full w-[60%] bg-amber-500 transition-all duration-300";
        label.textContent = "Medium Security";
        label.className = "text-[10px] text-amber-400 mt-1 block";
    } else {
        bar.className = "h-full w-[100%] bg-emerald-500 transition-all duration-300";
        label.textContent = "Ultra High Security! ✓";
        label.className = "text-[10px] text-emerald-400 mt-1 block";
    }
}

function copyPassword() {
    const pass = document.getElementById('passOutput').textContent;
    if (pass === 'Click Generate' || pass === 'Select at least one option!') return;
    navigator.clipboard.writeText(pass);
    alert('Password copied successfully!');
}

// === MODULE 9: QR CODE GENERATOR (Offline Friendly Script Loading) ===
function generateQRCode() {
    const text = document.getElementById('qrText').value || "https://kingpopcorn.hub";
    const qrOutputContainer = document.getElementById('qrOutput');
    qrOutputContainer.innerHTML = '';

    if (!window.QRCode) {
        // Dynamic loading of CDN to keep file footprint extremely small
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
        script.onload = () => {
            new QRCode(qrOutputContainer, {
                text: text,
                width: 128,
                height: 128
            });
        };
        document.head.appendChild(script);
    } else {
        new QRCode(qrOutputContainer, {
            text: text,
            width: 128,
            height: 128
        });
    }
}

// === MODULE 10: INTERACTIVE BMI CALCULATOR ===
function calcBMI() {
    const height = parseFloat(document.getElementById('bmiHeight').value) || 170;
    const weight = parseFloat(document.getElementById('bmiWeight').value) || 70;

    document.getElementById('bmiHeightVal').textContent = `${height} cm`;
    document.getElementById('bmiWeightVal').textContent = `${weight} kg`;

    const bmi = weight / ((height / 100) * (height / 100));
    document.getElementById('bmiResultValue').textContent = bmi.toFixed(1);

    const statusEl = document.getElementById('bmiResultStatus');
    if (bmi < 18.5) {
        statusEl.textContent = 'Underweight';
        statusEl.className = "inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20";
    } else if (bmi < 24.9) {
        statusEl.textContent = 'Normal Weight';
        statusEl.className = "inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20";
    } else if (bmi < 29.9) {
        statusEl.textContent = 'Overweight';
        statusEl.className = "inline-block px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/20";
    } else {
        statusEl.textContent = 'Obese';
        statusEl.className = "inline-block px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-bold rounded-full border border-rose-500/20";
    }
}

// === MODULE 11: ULTIMATE AGE CALCULATOR ===
function initAgeCalc() {
    if (ageInterval) clearInterval(ageInterval);
    document.getElementById('dob-input').value = '2000-01-01';
    calcAge();
}

function calcAge() {
    if (ageInterval) clearInterval(ageInterval);
    
    const dobValue = document.getElementById('dob-input').value;
    if (!dobValue) return;
    
    const dob = new Date(dobValue);
    
    function updateAge() {
        const now = new Date();
        if (now < dob) return;
        
        let years = now.getFullYear() - dob.getFullYear();
        let months = now.getMonth() - dob.getMonth();
        let days = now.getDate() - dob.getDate();
        
        if (days < 0) {
            months--;
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        
        const totalSeconds = Math.floor((now - dob) / 1000);
        
        document.getElementById('age-years').textContent = years;
        document.getElementById('age-months').textContent = months;
        document.getElementById('age-days').textContent = days;
        document.getElementById('age-seconds').textContent = totalSeconds.toLocaleString();
        
        // Next Birthday Countdown
        let nextBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
        if (now > nextBday) {
            nextBday.setFullYear(now.getFullYear() + 1);
        }
        const diffMs = nextBday - now;
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        document.getElementById('bday-countdown').textContent = `${daysLeft} Days to go!`;
        
        // Zodiac Sign Detect
        document.getElementById('zodiac-sign').textContent = getZodiac(dob.getDate(), dob.getMonth() + 1);
    }
    
    updateAge();
    ageInterval = setInterval(updateAge, 1000);
}

function getZodiac(day, month) {
    const signs = [
        { name: "Capricorn ♑", max: 19, m: 1 },
        { name: "Aquarius ♒", max: 18, m: 2 },
        { name: "Pisces ♓", max: 20, m: 3 },
        { name: "Aries ♈", max: 19, m: 4 },
        { name: "Taurus ♉", max: 20, m: 5 },
        { name: "Gemini ♊", max: 20, m: 6 },
        { name: "Cancer ♋", max: 22, m: 7 },
        { name: "Leo ♌", max: 22, m: 8 },
        { name: "Virgo ♍", max: 22, m: 9 },
        { name: "Libra ♎", max: 22, m: 10 },
        { name: "Scorpio ♏", max: 21, m: 11 },
        { name: "Sagittarius ♐", max: 21, m: 12 },
        { name: "Capricorn ♑", max: 31, m: 12 }
    ];
    const match = signs.find(s => (month === s.m && day <= s.max) || (month === s.m - 1 && day > s.max));
    return match ? match.name : "Capricorn ♑";
}

// === MODULE 12: CV / RESUME MAKER ===
function updateCV() {
    const name = document.getElementById('cvName').value;
    const title = document.getElementById('cvTitle').value;
    const phone = document.getElementById('cvPhone').value;
    const email = document.getElementById('cvEmail').value;
    const summary = document.getElementById('cvSummary').value;
    const exp = document.getElementById('cvExp').value;

    document.getElementById('previewName').textContent = name;
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewPhone').textContent = phone;
    document.getElementById('previewEmail').textContent = email;
    document.getElementById('previewSummary').textContent = summary;
    document.getElementById('previewExp').textContent = exp;
}

function printCV() {
    updateCV();
    const style = document.createElement('style');
    style.id = "cv-print-helper";
    style.innerHTML = `
        @media print {
            body * { visibility: hidden; }
            #cv-preview-area, #cv-preview-area * { visibility: visible; }
            #cv-preview-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
                padding: 0 !important;
                margin: 0 !important;
            }
        }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => {
        const styleEl = document.getElementById('cv-print-helper');
        if (styleEl) styleEl.remove();
    }, 1000);
}

// ----------------------------------------------------
// DRAWER / ADSENSE PAGES COMPLIANCE
// ----------------------------------------------------
const compliancePages = {
    'about-us': {
        title: 'About Us',
        content: 'Welcome to King Popcorn Hub. We offer an all-in-one suite of 100% free offline-capable tools, localized precisely for Pakistani users. Built using pure high-performance native browser frameworks.'
    },
    'privacy-policy': {
        title: 'Privacy Policy',
        content: 'Your security is paramount. We do not maintain databases or host server processing pipelines. All actions—including image file transformations, secure passwords generation, and CV prints—run strictly inside your local client browser execution stack.'
    },
    'terms-conditions': {
        title: 'Terms & Conditions',
        content: 'Our applications are designed with exact accuracy limits based on modern standards (Federal Board of Revenue tax slabs 2026-2027 and local land conversion matrices). All software modules are provided "as-is" with zero third-party data tracking.'
    },
    'contact-us': {
        title: 'Contact Us',
        content: 'Need support, custom feature installations, or business collaborations? Reach out directly via our secure portals at our Faisalabad Head Office situated in RCG Mall.'
    }
};

function checkHashRoute() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    if (compliancePages[hash]) {
        openDrawer(hash);
    } else {
        const appMatch = document.querySelector(`[onclick*="'${hash}'"]`);
        if (appMatch) {
            appMatch.click();
        }
    }
}

function openDrawer(pageId) {
    const overlay = document.getElementById('drawerOverlay');
    const drawer = document.getElementById('drawer');
    const title = document.getElementById('drawerTitle');
    const content = document.getElementById('drawerContent');

    title.textContent = compliancePages[pageId].title;
    content.innerHTML = `<p class="leading-relaxed">${compliancePages[pageId].content}</p>`;

    overlay.classList.remove('hidden');
    drawer.classList.remove('translate-x-full');
    
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
    }, 50);
}

function closeDrawer() {
    const overlay = document.getElementById('drawerOverlay');
    const drawer = document.getElementById('drawer');

    overlay.classList.add('opacity-0');
    drawer.classList.add('translate-x-full');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        clearUrlHash();
    }, 300);
}

function updateUrlHash(hash) {
    window.history.pushState(null, null, `#${hash}`);
}

function clearUrlHash() {
    window.history.pushState(null, null, ' ');
}

// Window Event Listeners
window.addEventListener('hashchange', checkHashRoute);
window.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
    checkHashRoute();
});