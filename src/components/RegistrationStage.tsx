import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StudentInfo } from '../types';
import { User, GraduationCap, Phone, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { playSound } from './SoundEffects';

interface RegistrationStageProps {
  onCompleteRegistration: (info: StudentInfo) => void;
  onAddXp: (amount: number) => void;
  soundEnabled: boolean;
  initialInfo?: StudentInfo;
}

export const RegistrationStage: React.FC<RegistrationStageProps> = ({
  onCompleteRegistration,
  onAddXp,
  soundEnabled,
  initialInfo,
}) => {
  const [fullName, setFullName] = useState(initialInfo?.fullName || '');
  const [classGroup, setClassGroup] = useState<StudentInfo['classGroup']>(initialInfo?.classGroup || '');
  const [phone, setPhone] = useState(initialInfo?.phone || '');
  const [guardianName, setGuardianName] = useState(initialInfo?.guardianName || '');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper for formatting phone number: (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = 'Informe o seu nome completo (mínimo 3 letras).';
    }

    if (!classGroup) {
      newErrors.classGroup = 'Selecione a sua turma.';
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length < 10) {
      newErrors.phone = 'Informe um telefone válido com DDD.';
    }

    if (!guardianName.trim() || guardianName.trim().length < 3) {
      newErrors.guardianName = 'Informe o nome completo do responsável.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      playSound('click', soundEnabled);
      return;
    }

    playSound('success', soundEnabled);
    onAddXp(25);
    onCompleteRegistration({
      fullName: fullName.trim(),
      classGroup,
      phone: phone.trim(),
      guardianName: guardianName.trim(),
    });
  };

  const classOptions: StudentInfo['classGroup'][] = ['9ºA', '9ºB', '9ºC', '9ºD'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Stage Header */}
      <div className="mb-6 flex items-center justify-between bg-[#0d1e3a]/90 p-5 rounded-2xl border border-blue-500/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/20 text-blue-300 font-extrabold text-xs px-3 py-1 rounded-lg border border-blue-500/40 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-400" />
              Alistamento Cívico-Militar
            </span>
            <span className="text-blue-200/70 text-xs font-bold uppercase tracking-widest">
              Etapa 1: Registro Tático
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Preencha sua Ficha de Alistamento
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-amber-300 font-black text-sm bg-blue-950/90 px-3.5 py-1.5 rounded-full border border-amber-400/40 shadow-md">
          <Sparkles size={16} className="fill-amber-400 text-amber-400 animate-pulse" />
          <span>+25 XP TÁTICO</span>
        </div>
      </div>

      {/* Main Registration Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#09172e]/90 border-2 border-blue-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-blue-600" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Nome Completo */}
          <div>
            <label className="block text-blue-100 text-sm font-bold mb-2 flex items-center gap-2">
              <User size={18} className="text-amber-400" />
              <span>Nome Completo do Aluno (Recruta) *</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
              }}
              placeholder="Ex: Gabriel Silva Santos"
              className={`w-full bg-slate-950/90 border ${
                errors.fullName ? 'border-rose-500' : 'border-blue-500/30 focus:border-amber-400'
              } text-white text-base px-4 py-3.5 rounded-xl outline-none transition-all placeholder:text-slate-500 font-medium`}
            />
            {errors.fullName && (
              <p className="text-rose-400 text-xs font-medium mt-1.5">{errors.fullName}</p>
            )}
          </div>

          {/* Turma (9ºA, 9ºB, 9ºC, 9ºD) */}
          <div>
            <label className="block text-blue-100 text-sm font-bold mb-2 flex items-center gap-2">
              <GraduationCap size={18} className="text-blue-400" />
              <span>Selecione seu Esquadrão / Turma *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {classOptions.map((option) => {
                const isSelected = classGroup === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setClassGroup(option);
                      if (errors.classGroup) setErrors((prev) => ({ ...prev, classGroup: '' }));
                      playSound('click', soundEnabled);
                    }}
                    className={`py-3.5 px-4 rounded-xl border-2 font-black text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-800 to-blue-700 border-amber-400 text-amber-300 shadow-lg shadow-blue-950/80 ring-2 ring-amber-400/40'
                        : 'bg-slate-950/80 border-blue-500/20 hover:border-blue-400/50 text-slate-300 hover:bg-blue-950/40'
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={18} className="text-amber-400" />}
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
            {errors.classGroup && (
              <p className="text-rose-400 text-xs font-medium mt-1.5">{errors.classGroup}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-blue-100 text-sm font-bold mb-2 flex items-center gap-2">
              <Phone size={18} className="text-amber-400" />
              <span>Telefone de Contato Tático (WhatsApp) *</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999"
              className={`w-full bg-slate-950/90 border ${
                errors.phone ? 'border-rose-500' : 'border-blue-500/30 focus:border-amber-400'
              } text-white text-base px-4 py-3.5 rounded-xl outline-none transition-all placeholder:text-slate-500 font-medium`}
            />
            {errors.phone && (
              <p className="text-rose-400 text-xs font-medium mt-1.5">{errors.phone}</p>
            )}
          </div>

          {/* Nome do Responsável */}
          <div>
            <label className="block text-blue-100 text-sm font-bold mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-400" />
              <span>Nome do Responsável Legal *</span>
            </label>
            <input
              type="text"
              value={guardianName}
              onChange={(e) => {
                setGuardianName(e.target.value);
                if (errors.guardianName) setErrors((prev) => ({ ...prev, guardianName: '' }));
              }}
              placeholder="Ex: Maria Oliveira Silva"
              className={`w-full bg-slate-950/90 border ${
                errors.guardianName ? 'border-rose-500' : 'border-blue-500/30 focus:border-amber-400'
              } text-white text-base px-4 py-3.5 rounded-xl outline-none transition-all placeholder:text-slate-500 font-medium`}
            />
            {errors.guardianName && (
              <p className="text-rose-400 text-xs font-medium mt-1.5">{errors.guardianName}</p>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 active:scale-98 transition-all border-2 border-amber-300 cursor-pointer tracking-wider"
            >
              <span>CONFIRMAR ALISTAMENTO & IR PARA OS CENÁRIOS</span>
              <ArrowRight size={22} className="text-slate-950" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
